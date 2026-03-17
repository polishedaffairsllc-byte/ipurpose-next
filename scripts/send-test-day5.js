const fs = require('fs');
const path = require('path');

// Parse .env.local manually
const envFile = fs.readFileSync(path.resolve(__dirname, '../.env.local'), 'utf8');
for (const line of envFile.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const idx = trimmed.indexOf('=');
  if (idx === -1) continue;
  const key = trimmed.slice(0, idx).trim();
  const val = trimmed.slice(idx + 1).trim();
  process.env[key] = val;
}

const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_ADDRESS = 'iPurpose <renita@ipurposesoul.com>';

const email = 'mshmltn@gmail.com';
const name = 'Renita';

const expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Georgia, 'Times New Roman', serif; line-height: 1.9; color: #2A2A2A; background: #fff; }
          .container { max-width: 580px; margin: 0 auto; padding: 48px 24px; }
          p { font-size: 16px; margin: 0 0 16px 0; }
          .offer { background: rgba(156, 136, 255, 0.06); border: 1px solid #9C88FF; border-radius: 10px; padding: 24px 28px; margin: 32px 0; }
          .offer p { margin: 4px 0; }
          .price { font-size: 28px; color: #9C88FF; font-weight: bold; margin: 8px 0 4px !important; }
          .expires { font-size: 13px; color: #E74C3C; margin-top: 8px !important; }
          .cta { display: inline-block; background: #9C88FF; color: #fff; padding: 14px 36px; border-radius: 30px; text-decoration: none; font-weight: bold; font-size: 16px; margin: 24px 0; }
          .divider { border: none; border-top: 1px solid #ede8f7; margin: 28px 0; }
          .footer { margin-top: 48px; padding-top: 20px; border-top: 1px solid #ede8f7; font-size: 12px; color: #bbb; text-align: center; }
          .footer a { color: #9C88FF; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <p>Hey ${name},</p>

          <p>A few years ago, I lost my job.</p>

          <p>And instead of just finding a new one, I spent a year trying to become what everyone else needed me to be.</p>

          <p>
            Different r&eacute;sum&eacute;.<br>
            Different pitch.<br>
            A different version of me &mdash; shaped around what fit <em>their</em> story.
          </p>

          <p>It was exhausting.<br>
          And honestly&hellip; it wasn&rsquo;t working.</p>

          <p>Then something shifted.</p>

          <p>I stopped asking, &ldquo;what do they need?&rdquo;<br>
          and started asking, &ldquo;what is actually mine to do?&rdquo;</p>

          <p>That question changed everything.</p>

          <p>iPurpose wasn&rsquo;t built as a brand. It came out of a moment &mdash; sitting in my car after another interview, wondering, &ldquo;Is there more for me than this?&rdquo; I knew I wasn&rsquo;t the only one asking that.</p>

          <hr class="divider">

          <p>Five days ago, you took the Clarity Check.<br>
          You saw something.<br>
          A recognition.<br>
          A shift.<br>
          A sense that the life you&rsquo;ve been fitting yourself into might not actually be yours.</p>

          <p>Most people ignore that.<br>
          They go back to what&rsquo;s familiar.<br>
          They tell themselves they&rsquo;ll figure it out later.</p>

          <p>But if you&rsquo;re still here&hellip; something in you didn&rsquo;t let it go.</p>

          <hr class="divider">

          <p>That&rsquo;s where the Starter Pack comes in.</p>

          <p>Not a course.<br>
          Not more information.<br>
          It&rsquo;s the bridge between what you felt&hellip; and what you do with it.</p>

          <div class="offer">
            <p>For the next 7 days, I&rsquo;ve opened a founder&rsquo;s rate:</p>
            <p class="price">$27 <span style="font-size:16px; color:#999; font-weight:normal; text-decoration:line-through;">$47</span></p>
            <p class="expires">&#9200; Available until ${expiryDate}</p>
          </div>

          <p style="text-align:center;">
            <a href="https://ipurposesoul.com/starter-pack" class="cta">Step into the Starter Pack &rarr;</a>
          </p>

          <p>If that tug you felt during the Clarity Check is still there, this is your next step.</p>

          <p>&mdash; Renita</p>

          <div class="footer">
            <p>&copy; iPurpose Soul &mdash; <a href="https://ipurposesoul.com">ipurposesoul.com</a></p>
          </div>
        </div>
      </body>
    </html>
`;

resend.emails.send({
  from: FROM_ADDRESS,
  to: email,
  subject: "🪞 I almost missed this about myself",
  html: htmlContent,
}).then(() => {
  console.log(`✓ Test Day 5 email sent to ${email}`);
  process.exit(0);
}).catch(err => {
  console.error('✗ Failed to send:', err.message);
  process.exit(1);
});
