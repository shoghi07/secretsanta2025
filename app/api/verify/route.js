import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const LOCKOUT_DURATION_MS = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

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

    // Read data files
    const dataDir = path.join(process.cwd(), 'data');
    const secretsPath = path.join(dataDir, 'secrets.json');
    const lockoutsPath = path.join(dataDir, 'lockouts.json');

    const secretsData = JSON.parse(fs.readFileSync(secretsPath, 'utf8'));
    let lockoutsData = JSON.parse(fs.readFileSync(lockoutsPath, 'utf8'));

    const currentTime = Date.now();

    // Check if code is locked
    if (lockoutsData[receiver_code] !== undefined && lockoutsData[receiver_code] !== null) {
      const unlockTime = lockoutsData[receiver_code];
      if (unlockTime > currentTime) {
        return NextResponse.json(
          {
            error: 'locked',
            unlockTime
          },
          { status: 403 }
        );
      }
    }

    // Find member by unique_code
    const member = secretsData.members.find(
      (m) => m.unique_code.toLowerCase() === receiver_code.toLowerCase().trim()
    );

    if (!member) {
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
      lockoutsData[receiver_code.toUpperCase()] = unlockTime;
      fs.writeFileSync(lockoutsPath, JSON.stringify(lockoutsData, null, 2));

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
