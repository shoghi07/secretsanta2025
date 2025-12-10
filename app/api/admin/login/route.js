import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request) {
    try {
        const { userid, password } = await request.json();

        if (!userid || !password) {
            return NextResponse.json(
                { error: 'User ID and password are required' },
                { status: 400 }
            );
        }

        // Query admin from Supabase
        const { data: admin, error } = await supabase
            .from('admins')
            .select('*')
            .eq('userid', userid)
            .single();

        if (error || !admin || admin.password !== password) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Generate simple token (in production, use proper JWT)
        const token = Buffer.from(`${userid}:${Date.now()}`).toString('base64');

        return NextResponse.json({
            success: true,
            token
        });

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Login failed' },
            { status: 500 }
        );
    }
}
