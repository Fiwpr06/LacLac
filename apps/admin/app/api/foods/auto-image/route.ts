import { NextRequest, NextResponse } from 'next/server';

import { resolveAutoImageUrl } from '../../../../src/lib/auto-image';

export async function GET(request: NextRequest) {
  const name = request.nextUrl.searchParams.get('name')?.trim();

  if (!name) {
    return NextResponse.json(
      {
        success: false,
        message: 'Ten mon an la bat buoc',
      },
      { status: 400 },
    );
  }

  const imageUrl = await resolveAutoImageUrl(name);

  return NextResponse.json({
    success: true,
    data: {
      url: imageUrl,
    },
  });
}
