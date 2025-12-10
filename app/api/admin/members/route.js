import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - Fetch all members
export async function GET() {
    try {
        const { data: members, error } = await supabase
            .from('members')
            .select('*')
            .order('unique_code');

        if (error) {
            throw error;
        }

        return NextResponse.json({ members });
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

        // Check if code already exists
        const { data: existing } = await supabase
            .from('members')
            .select('id')
            .ilike('unique_code', unique_code.toUpperCase())
            .single();

        if (existing) {
            return NextResponse.json(
                { error: 'Member code already exists' },
                { status: 409 }
            );
        }

        // Add new member
        const { error } = await supabase
            .from('members')
            .insert({
                unique_code: unique_code.toUpperCase(),
                member_name,
                wish_items
            });

        if (error) {
            throw error;
        }

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

        // Update member
        const { error, count } = await supabase
            .from('members')
            .update({
                member_name,
                wish_items
            })
            .ilike('unique_code', unique_code.toUpperCase());

        if (error) {
            throw error;
        }

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

        // Delete member
        const { error } = await supabase
            .from('members')
            .delete()
            .ilike('unique_code', unique_code.toUpperCase());

        if (error) {
            throw error;
        }

        // Also remove from lockouts
        await supabase
            .from('lockouts')
            .delete()
            .eq('code', unique_code.toUpperCase());

        return NextResponse.json({ success: true, message: 'Member deleted successfully' });

    } catch (error) {
        console.error('Error deleting member:', error);
        return NextResponse.json(
            { error: 'Failed to delete member' },
            { status: 500 }
        );
    }
}
