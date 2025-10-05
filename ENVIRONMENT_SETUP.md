# Environment Setup

## Web3Forms Configuration

To enable the contact form functionality, you need to set up the Web3Forms access key.

### Steps:

1. **Get your Web3Forms access key:**
   - Visit [https://web3forms.com/](https://web3forms.com/)
   - Sign up for a free account
   - Create a new form and get your access key

2. **Create environment file:**
   - Create a file named `.env.local` in the root directory of your project
   - Add the following content:

```bash
# Web3Forms Configuration
NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY=your_actual_access_key_here

# HPO API Configuration (if needed)
NEXT_PUBLIC_HPO_API_BASE_URL=your_api_base_url_here
```

3. **Replace the placeholder:**
   - Replace `your_actual_access_key_here` with your actual Web3Forms access key
   - Replace `your_api_base_url_here` with your HPO API base URL (if applicable)

4. **Restart your development server:**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

### Important Notes:

- The `.env.local` file should be in the root directory (same level as `package.json`)
- Never commit the `.env.local` file to version control
- The `NEXT_PUBLIC_` prefix is required for client-side environment variables in Next.js
- If the access key is not configured, the form will show an error message

### Troubleshooting:

- If you see "Form configuration error. Please contact support." - the access key is not properly configured
- Check the browser console for detailed error messages
- Ensure the `.env.local` file is in the correct location
- Restart your development server after making changes to environment variables
