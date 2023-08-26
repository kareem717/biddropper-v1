// // import EmailTemplate from '@/components/ui/custom/EmailTemplate';
// // import { prisma } from '@/lib/prisma';
// // import crs from 'crypto-random-string';
// import { NextRequest, NextResponse } from 'next/server';
// import { ReactElement } from 'react';
// import { Resend } from 'resend';

// const resend = new Resend(`${process.env.RESEND_API_KEY}`);

// export async function POST(request: NextRequest) {
//   const requestBody = await request.json();
//   const token = await crs({ length: 6, type: 'numeric' });

//   await prisma.verificationToken.upsert({
//     where: { email: requestBody.email },
//     update: { otp: token, expires: new Date(Date.now() + 600000) },
//     create: {
//       email: requestBody.email,
//       otp: token,
//       expires: new Date(Date.now() + 600000),
//     },
//   });

//   try {
//     const data = await resend.emails.send({
//       from: process.env.EMAIL_FROM!,
//       to: requestBody.email,
//       subject: 'Sign in to Gear Shed',
//       react: EmailTemplate({ token: token }) as ReactElement,
//     });

//     return new NextResponse(JSON.stringify(data), { status: 200 });
//   } catch (error) {
//     console.log('Error occured', { error });
//     return new NextResponse('Internal Error', { status: 500 });
//   }
// }