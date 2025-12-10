import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const LOCKOUT_DURATION_MS = 4 * 60 * 60 * 1000; // 4 hours in milliseconds

export async function POST(request) {
  try {
    const { receiver_code, guessed_name } = await request.json();

    // Validate input
    if (!receiver_code || !guessed_name) {
      return NextResponse.json(
        { error: 'Both receiver code and name are required' },
        { status: 400 }
      );
    }

    const currentTime = Date.now();
    const codeUpper = receiver_code.toUpperCase().trim();

    // Check if code is locked
    const { data: lockout } = await supabase
      .from('lockouts')
      .select('unlock_time')
      .eq('code', codeUpper)
      .single();

    if (lockout && lockout.unlock_time > currentTime) {
      return NextResponse.json(
        {
          error: 'locked',
          unlockTime: lockout.unlock_time
        },
        { status: 403 }
      );
    }

    // Find member by unique_code
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('*')
      .ilike('unique_code', codeUpper)
      .single();

    if (memberError || !member) {
      return NextResponse.json(
        { error: 'invalid_code', message: 'Invalid receiver code.' },
        { status: 404 }
      );
    }

    // Compare names (case-insensitive, trimmed)
    const normalizedGuess = guessed_name.toLowerCase().trim();
    const normalizedName = member.member_name.toLowerCase().trim();

    if (normalizedGuess !== normalizedName) {
      // Lock the code for 6 hours
      const unlockTime = currentTime + LOCKOUT_DURATION_MS;

      // Upsert lockout record
      await supabase
        .from('lockouts')
        .upsert({ code: codeUpper, unlock_time: unlockTime });

      return NextResponse.json(
        { error: 'wrong_name', unlockTime },
        { status: 401 }
      );
    }

    // Success! Return the first wish item
    return NextResponse.json({
      success: true,
      wish_item: member.wish_items[0],
      member_name: member.member_name
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'server_error', message: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
