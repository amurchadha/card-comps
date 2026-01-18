import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET() {
  try {
    const supabase = getSupabase();

    const { data: presets, error } = await supabase
      .from('grading_presets')
      .select('company, service_level, base_fee, max_value_threshold, estimated_turnaround_days, notes')
      .order('company')
      .order('base_fee');

    if (error) {
      console.error('Grading presets error:', error);
      return NextResponse.json({ success: false, error: 'Failed to fetch presets' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      presets: presets || []
    });
  } catch (error) {
    console.error('Grading presets API error:', error);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}
