# Email Verification Setup Guide

## Overview

This guide will help you set up email verification for new user signups in NovaCar using Supabase.

## Email Template

The HTML email template is located at: `emails/verification-email.html`

## Supabase Configuration

### Step 1: Access Email Templates

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Email Templates**
3. Select **Confirm signup** template

### Step 2: Update the Email Template

Copy the contents of `emails/verification-email.html` and paste it into the Supabase email template editor.

### Step 3: Configure Email Settings

1. Go to **Authentication** → **Settings**
2. Under **Email** section, configure:
   - **Enable email confirmations**: ✅ Enabled
   - **Confirm email**: Required for signup
   - **Email confirmation expiry**: 24 hours (86400 seconds)

### Step 4: Set Redirect URL

1. In **Authentication** → **URL Configuration**
2. Add your redirect URL to **Redirect URLs** whitelist:
   ```
   http://localhost:3000/verify
   https://yourdomain.com/verify
   ```

### Step 5: Environment Variables

Make sure your `.env.local` has:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000  # or your production URL
```

## Template Variables

Supabase automatically replaces these variables in the email template:

- `{{ .Email }}` - User's email address
- `{{ .Name }}` - User's full name (from metadata)
- `{{ .ConfirmationURL }}` - Verification link (automatically generated)
- `{{ .Token }}` - Verification token
- `{{ .TokenHash }}` - Hashed token

## Email Design Features

✨ **Brand Colors**:

- Primary Orange: `#ff7724`
- Accent Pink: `#ff206e`
- Dark Background: `#0a0a0a`
- Text: `#f5f5f5` and `#a1a1aa`

🎨 **Design Elements**:

- NovaCar logo in header
- Gradient call-to-action button
- Info boxes with security tips
- Alternative link section
- Mobile responsive design
- Dark theme matching the website

📧 **Email Sections**:

1. **Header** - NovaCar logo and tagline
2. **Greeting** - Personalized welcome message
3. **CTA Button** - Prominent verify email button
4. **Info Box** - Expiry notice and security info
5. **What's Next** - Benefits of verification
6. **Alternative Link** - Backup verification link
7. **Security Notice** - Security tips
8. **Footer** - Contact info and copyright

## Testing Email Verification

### Local Testing

1. Sign up with a real email address
2. Check your inbox for the verification email
3. Click the verification link
4. Should redirect to `/verify` page
5. Email should be marked as verified in Supabase

### Test Emails with Mailtrap (Development)

1. Sign up for [Mailtrap](https://mailtrap.io/)
2. In Supabase → **Settings** → **Auth**
3. Configure SMTP settings with Mailtrap credentials
4. All emails will be caught by Mailtrap during development

## Customization

### Changing Colors

Edit the CSS in `verification-email.html`:

```css
/* Primary color */
.logo,
.verify-button {
  color: #ff7724; /* Change this */
}

/* Accent color */
.highlight {
  color: #ff206e; /* Change this */
}
```

### Changing Content

Edit the HTML content sections:

- Welcome message
- What's Next bullets
- Footer information
- Security tips

### Adding Your Logo Image

Replace the text logo with an image:

```html
<div class="header">
  <img
    src="https://yourdomain.com/logo.png"
    alt="NovaCar"
    style="max-width: 200px;"
  />
</div>
```

## User Flow

```
1. User signs up
   ↓
2. Supabase sends verification email
   ↓
3. User clicks "Verify Your Email Address" button
   ↓
4. Redirected to /verify page
   ↓
5. Token is verified automatically
   ↓
6. Success: User redirected to /home
   Error: User shown error message with retry option
```

## Troubleshooting

### Email Not Sending

1. Check Supabase logs: **Authentication** → **Logs**
2. Verify SMTP settings are configured
3. Check spam folder
4. Ensure redirect URL is whitelisted

### Verification Link Not Working

1. Check if link has expired (24 hours)
2. Verify redirect URL is correct
3. Check browser console for errors
4. Ensure token is valid in URL

### Email Not Verified After Clicking Link

1. Check Supabase auth logs
2. Verify `/verify` page is handling token correctly
3. Check if `emailRedirectTo` is properly configured
4. Ensure user exists in auth.users table

## Production Checklist

Before going live:

- [ ] Replace `NEXT_PUBLIC_APP_URL` with production URL
- [ ] Add production URL to Supabase redirect URLs whitelist
- [ ] Configure production SMTP settings (SendGrid, AWS SES, etc.)
- [ ] Test email delivery in production
- [ ] Verify email design in different email clients
- [ ] Set up email monitoring/logging
- [ ] Add support email address
- [ ] Update footer with real contact information

## Email Client Testing

Test the email in various clients:

- Gmail (web, mobile)
- Outlook (web, desktop)
- Apple Mail (macOS, iOS)
- Yahoo Mail
- Thunderbird

Use services like [Litmus](https://litmus.com/) or [Email on Acid](https://www.emailonacid.com/) for comprehensive testing.

## SMTP Providers

Recommended SMTP services for production:

1. **SendGrid** - 100 emails/day free
2. **Mailgun** - 5,000 emails/month free
3. **AWS SES** - 62,000 emails/month free (with EC2)
4. **Postmark** - 100 emails/month free
5. **Resend** - 3,000 emails/month free

## Support

For issues or questions:

- Check Supabase documentation: https://supabase.com/docs/guides/auth
- Supabase Discord: https://discord.supabase.com
- GitHub Issues: https://github.com/supabase/supabase/issues

## Security Best Practices

1. ✅ Never store verification tokens in database
2. ✅ Tokens expire after 24 hours
3. ✅ Use HTTPS for all verification links
4. ✅ Rate limit signup attempts
5. ✅ Implement CAPTCHA for signup form
6. ✅ Log all verification attempts
7. ✅ Send notification on successful verification
8. ✅ Require re-verification for email changes
