import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');
const secretsPath = path.join(dataDir, 'secrets.json');
const lockoutsPath = path.join(dataDir, 'lockouts.json');

// GET - Fetch all members
export async function GET() {
    try {
        const secretsData = JSON.parse(fs.readFileSync(secretsPath, 'utf8'));
        return NextResponse.json(secretsData);
    } catch (error) {
        console.error('Error reading members:', error);
        return NextResponse.json(
            { error: 'Failed to fetch members' },
            { status: 500 }
        );
    }
}

// POST - Add new member
export async function POST(request) {
    try {
        const { unique_code, member_name, wish_items } = await request.json();

        if (!unique_code || !member_name || !wish_items || wish_items.length === 0) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            );
        }

        const secretsData = JSON.parse(fs.readFileSync(secretsPath, 'utf8'));

        // Check if code already exists
        const exists = secretsData.members.some(
            m => m.unique_code.toLowerCase() === unique_code.toLowerCase()
        );

        if (exists) {
            return NextResponse.json(
                { error: 'Member code already exists' },
                { status: 409 }
            );
        }

        // Add new member
        secretsData.members.push({
            unique_code: unique_code.toUpperCase(),
            member_name,
            wish_items
        });

        fs.writeFileSync(secretsPath, JSON.stringify(secretsData, null, 2));

        // Add to lockouts with null (unlocked)
        const lockoutsData = JSON.parse(fs.readFileSync(lockoutsPath, 'utf8'));
        lockoutsData[unique_code.toUpperCase()] = null;
        fs.writeFileSync(lockoutsPath, JSON.stringify(lockoutsData, null, 2));

        return NextResponse.json({ success: true, message: 'Member added successfully' });

    } catch (error) {
        console.error('Error adding member:', error);
        return NextResponse.json(
            { error: 'Failed to add member' },
            { status: 500 }
        );
    }
}

// PUT - Update existing member
export async function PUT(request) {
    try {
        const { unique_code, member_name, wish_items } = await request.json();

        if (!unique_code || !member_name || !wish_items) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            );
        }

        const secretsData = JSON.parse(fs.readFileSync(secretsPath, 'utf8'));

        const memberIndex = secretsData.members.findIndex(
            m => m.unique_code.toLowerCase() === unique_code.toLowerCase()
        );

        if (memberIndex === -1) {
            return NextResponse.json(
                { error: 'Member not found' },
                { status: 404 }
            );
        }

        // Update member
        secretsData.members[memberIndex] = {
            unique_code: unique_code.toUpperCase(),
            member_name,
            wish_items
        };

        fs.writeFileSync(secretsPath, JSON.stringify(secretsData, null, 2));

        return NextResponse.json({ success: true, message: 'Member updated successfully' });

    } catch (error) {
        console.error('Error updating member:', error);
        return NextResponse.json(
            { error: 'Failed to update member' },
            { status: 500 }
        );
    }
}

// DELETE - Remove member
export async function DELETE(request) {
    try {
        const { unique_code } = await request.json();

        if (!unique_code) {
            return NextResponse.json(
                { error: 'Member code is required' },
                { status: 400 }
            );
        }

        const secretsData = JSON.parse(fs.readFileSync(secretsPath, 'utf8'));

        const memberIndex = secretsData.members.findIndex(
            m => m.unique_code.toLowerCase() === unique_code.toLowerCase()
        );

        if (memberIndex === -1) {
            return NextResponse.json(
                { error: 'Member not found' },
                { status: 404 }
            );
        }

        // Remove member
        secretsData.members.splice(memberIndex, 1);
        fs.writeFileSync(secretsPath, JSON.stringify(secretsData, null, 2));

        // Remove from lockouts
        const lockoutsData = JSON.parse(fs.readFileSync(lockoutsPath, 'utf8'));
        delete lockoutsData[unique_code.toUpperCase()];
        fs.writeFileSync(lockoutsPath, JSON.stringify(lockoutsData, null, 2));

        return NextResponse.json({ success: true, message: 'Member deleted successfully' });

    } catch (error) {
        console.error('Error deleting member:', error);
        return NextResponse.json(
            { error: 'Failed to delete member' },
            { status: 500 }
        );
    }
}
