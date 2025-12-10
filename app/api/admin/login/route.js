import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
    try {
        const { userid, password } = await request.json();

        if (!userid || !password) {
            return NextResponse.json(
                { error: 'User ID and password are required' },
                { status: 400 }
            );
        }

        const dataDir = path.join(process.cwd(), 'data');
        const adminPath = path.join(dataDir, 'admin.json');
        const adminData = JSON.parse(fs.readFileSync(adminPath, 'utf8'));

        if (userid === adminData.admin_user && password === adminData.admin_password) {
            // Generate a simple session token
            const token = Buffer.from(`${userid}:${Date.now()}`).toString('base64');

            return NextResponse.json({
                success: true,
                token
            });
        }

        return NextResponse.json(
            { error: 'Invalid credentials' },
            { status: 401 }
        );

    } catch (error) {
        console.error('Auth Error:', error);
        return NextResponse.json(
            { error: 'Authentication failed' },
            { status: 500 }
        );
    }
}
