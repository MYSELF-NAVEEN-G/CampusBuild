# CampusBuild Solution

This is a Next.js starter application built with Firebase Studio.

## Deploying to Vercel with GitHub

This guide will walk you through deploying your application to Vercel and setting up automatic deployments from your GitHub repository.

### Step 1: Push Your Project to GitHub

First, you need to push your entire project codebase to a new repository on GitHub.

1.  **Create a GitHub Repository:** Go to [GitHub](https://github.com/new) and create a new repository. Do **not** initialize it with a README, .gitignore, or license file, as your project already has these.
2.  **Push Your Code:** In your local project terminal, run the following commands to push your code to the new repository. Replace `YOUR_GITHUB_USERNAME` and `YOUR_REPOSITORY_NAME` with your details.

    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    git branch -M main
    git remote add origin https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME.git
    git push -u origin main
    ```

### Step 2: Deploy on Vercel

Vercel is a platform that makes it incredibly easy to deploy Next.js applications.

1.  **Sign Up/Log In to Vercel:** Go to [vercel.com](https://vercel.com/) and sign up for an account, preferably using your GitHub account for seamless integration.

2.  **Import Your Project:**
    *   Once logged in, click on "Add New..." and select "Project".
    *   In the "Import Git Repository" section, find the GitHub repository you just created and click "Import".
    *   Vercel will automatically detect that it is a Next.js project. You don't need to change any build settings.

### Step 3: Configure Firebase Environment Variables (Crucial!)

Your application needs to connect to your Firebase project. Vercel needs the credentials to do this during the build process and on the server.

1.  **Find Your Firebase Credentials:** Your Firebase configuration is located in the `src/firebase/config.ts` file. You will need these values.

2.  **Add Environment Variables in Vercel:**
    *   In the Vercel project configuration screen, expand the "Environment Variables" section.
    *   Add the following variables one by one, copying the values from your `src/firebase/config.ts` file.

| Name | Value |
| :--- | :--- |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Your `projectId` value |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Your `appId` value |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Your `apiKey` value |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`| Your `authDomain` value |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`| Your `messagingSenderId` value |

    *Make sure the names match exactly.* These `NEXT_PUBLIC_` prefixes are how Next.js makes variables accessible in the browser.

### Step 4: Deploy

1.  Click the **Deploy** button.
2.  Vercel will now build and deploy your application. Once it's finished, you'll get a public URL for your live site.

### How Auto-Updates Work

Because you connected your Vercel project to GitHub, any time you (or Firebase Studio) push a new commit to your `main` branch, Vercel will automatically start a new deployment. You don't have to do anything else. Your site will always be up-to-date with your latest code.
