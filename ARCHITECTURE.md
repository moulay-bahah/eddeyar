# Project Architecture & Entry Points

## 🚀 Entry Points

### 1. **Main Entry Point: `package.json`**

- **Script**: `pnpm run dev` → `next dev --turbopack`
- **What it does**: Starts the Next.js development server
- **Port**: http://localhost:3000

#### 📖 **Beginner's Guide: Understanding `package.json`**

Think of `package.json` as the **recipe book** for your project. It tells your computer what ingredients (packages) you need and how to cook (run) your application.

**What happens when you run `pnpm run dev`:**

1. **Command execution**:

   ```bash
   pnpm run dev
   ```

   - `pnpm` = Package manager (like npm, but faster)
   - `run` = Execute a script
   - `dev` = The script name defined in `package.json`

2. **Script runs** (line 10 in package.json):

   ```json
   "dev": "next dev --turbopack"
   ```

   - `next dev` = Starts Next.js development server
   - `--turbopack` = Uses Turbopack (faster bundler than Webpack)
   - This command starts your web server

3. **Server starts**:

   - Next.js reads your project files
   - Compiles TypeScript/React code
   - Starts listening on port 3000
   - Opens `http://localhost:3000` in your browser

4. **What you'll see**:
   - Terminal shows: "Ready on http://localhost:3000"
   - Browser opens automatically
   - Any code changes automatically refresh the page (hot reload)

**Key scripts explained:**

- `"dev"` = Development mode (with hot reload, error messages, etc.)
- `"build"` = Creates production-ready files (optimized, minified)
- `"start"` = Runs the production build
- `"lint"` = Checks code for errors
- `"check-types"` = Verifies TypeScript types are correct

**Dependencies section:**

- Lists all packages your project needs (React, Next.js, MongoDB, etc.)
- When you run `pnpm install`, it downloads all these packages

**Real-world analogy:**

- `package.json` = Recipe card with ingredients list
- `pnpm install` = Shopping for ingredients
- `pnpm run dev` = Cooking the meal (starting the server)

### 2. **Next.js Entry Point: `app/[locale]/layout.tsx`**

- **Purpose**: Root layout for all pages
- **What it does**:
  - Sets up HTML structure with locale (Arabic/French)
  - Handles RTL/LTR text direction
  - Checks for JWT cookie (authentication)
  - Loads Google Analytics
  - Wraps app with i18n providers
  - Renders navigation conditionally

#### 📖 **Beginner's Guide: Understanding `layout.tsx`**

Think of `layout.tsx` as the **wrapper** that goes around every page in your app. It's like the frame of a picture - it stays the same while the content inside changes.

**What happens step-by-step:**

1. **Function receives parameters** (lines 14-22):

   ```typescript
   export default async function RootLayout(props) {
     const params = await props.params;  // Gets locale from URL (e.g., "ar" or "fr")
     const { children } = props;         // This is the act ual page content
   ```

   - `params.locale` = The language from the URL (`/ar` = Arabic, `/fr` = French)
   - `children` = Whatever page the user is visiting (homepage, about page, etc.)

2. **Determines text direction** (lines 26-34):

   ```typescript
   let dir = "ltr"; // Default: left-to-right (for French)
   if (params.locale) {
     const locale = new Locale(params.locale);
     dir = locale.textInfo.direction; // "rtl" for Arabic, "ltr" for French
   }
   ```

   - **Why this matters**: Arabic reads right-to-left (RTL), French reads left-to-right (LTR)
   - This tells the browser how to display text

3. **Checks if user is logged in** (line 35):

   ```typescript
   const hasSession = (await cookies()).has("jwt");
   ```

   - Looks for a cookie named `jwt` (JSON Web Token)
   - If cookie exists → user is logged in
   - If no cookie → user is not logged in
   - This is used to show/hide navigation items

4. **Returns the HTML structure** (lines 37-65):

   ```typescript
   return (
     <html lang={params.locale} dir={dir}>
       <head>{/* Google Analytics scripts */}</head>
       <body>
         <Providers locale={params.locale}>
           <ConditionalNav isAuthenticated={hasSession} />
           {children} {/* The actual page content goes here */}
         </Providers>
       </body>
     </html>
   );
   ```

   **Breaking this down:**

   - `<html lang={params.locale} dir={dir}>`

     - Sets the language attribute (`lang="ar"` or `lang="fr"`)
     - Sets text direction (`dir="rtl"` or `dir="ltr"`)

   - `<head>` section:

     - Loads Google Analytics scripts to track website visitors
     - These scripts run after the page becomes interactive

   - `<body>` section:
     - `<Providers>` = Wraps the app with translation providers (makes `t()` function work)
     - `<ConditionalNav>` = Shows navigation bar (different items if logged in vs. not logged in)
     - `{children}` = **This is where the actual page content appears!**
       - If user visits `/ar` → `page.tsx` content goes here
       - If user visits `/ar/about` → `about/page.tsx` content goes here

**Real-world analogy:**

- `layout.tsx` = The house structure (walls, roof, foundation)
- `page.tsx` = The furniture inside (changes per room)
- Every page uses the same layout, but has different content

**Key takeaway:** This file runs **once per page load** and wraps every page with the same HTML structure, language settings, and navigation. The `{children}` part is where each specific page's content gets inserted.

### 3. **Homepage Entry Point: `app/[locale]/page.tsx`**

- **Route**: `/` or `/ar` or `/fr`
- **What it does**:
  - Fetches listings from MongoDB
  - Applies search filters (category, location, price, etc.)
  - Paginates results (6 items per page)
  - Checks user favorites
  - Renders search form + listings

#### 📖 **Beginner's Guide: Understanding `page.tsx`**

This is the **homepage** of your website - the first thing users see when they visit your site. It's like the main page of a newspaper with listings and a search form.

**What happens step-by-step:**

1. **Function receives URL parameters** (lines 25-31):

   ```typescript
   export default async function Home({ params, searchParams }) {
     const { locale } = await params;  // "ar" or "fr" from URL
     const sp = await searchParams;     // ?categorieId=123&price=50000
   ```

   - `params.locale` = Language from URL (`/ar` or `/fr`)
   - `searchParams` = Query string from URL (filters user selected)
   - Example: `/ar?categorieId=123&price=50000` → `sp = { categorieId: "123", price: "50000" }`

2. **Calculates pagination** (lines 36-38):

   ```typescript
   const currentPage = Number(sp.page) || 1; // Which page? (default: page 1)
   const itemsPerPage = 6; // Show 6 items per page
   const skip = (currentPage - 1) * itemsPerPage; // Skip first X items
   ```

   - **Why this matters**: If user is on page 2, skip first 6 items, show items 7-12
   - Like turning pages in a book - page 1 shows items 1-6, page 2 shows 7-12

3. **Builds database query** (lines 40-69):

   ```typescript
   const query = { status: "active", isPublished: true }; // Base filters

   // Add filters from URL if they exist
   if (sp.categorieId) query.categorieId = sp.categorieId;
   if (sp.price) query.price = Number(sp.price);
   if (sp.wilayaId) query.lieuId = sp.wilayaId;
   ```

   - Starts with base query: only show active, published listings
   - Adds user's search filters one by one
   - Final query might look like:
     ```typescript
     {
       status: "active",
       isPublished: true,
       categorieId: "123",
       price: 50000,
       lieuId: "nkc123"
     }
     ```

4. **Fetches data from MongoDB** (lines 72-78):

   ```typescript
   const db = await getDb(); // Connect to database
   const coll = db.collection("annonces"); // Get "annonces" collection

   const [rows, totalCount] = await Promise.all([
     coll
       .find(query) // Find matching listings
       .sort({ isSponsored: -1 }) // Sponsored first, then newest
       .skip(skip) // Skip items for pagination
       .limit(itemsPerPage) // Only get 6 items
       .toArray(), // Convert to array
     coll.countDocuments(query), // Count total matching items
   ]);
   ```

   - **What this does**:
     - Connects to MongoDB database
     - Searches "annonces" collection (like a table)
     - Finds listings matching the query
     - Sorts: sponsored listings first, then by date (newest first)
     - Gets only 6 items for current page
     - Also counts total matching items (for pagination)

5. **Transforms data** (lines 80-111):

   ```typescript
   const annonces = rows.map((a) => ({
     id: String(a._id),
     title: a.title,
     price: Number(a.price),
     // ... more fields
   }));
   ```

   - **Why transform?**: MongoDB uses `_id`, but your app uses `id`
   - Converts data to match your TypeScript types
   - Like translating between two languages

6. **Gets user favorites** (lines 116-123):

   ```typescript
   const user = await getUserFromCookies(); // Check if logged in
   let favoriteIds = [];
   if (user?.id) {
     // Get user's favorite listing IDs from database
     const favs = await db
       .collection("favorites")
       .find({ userId: user.id })
       .toArray();
     favoriteIds = favs.map((f) => String(f.annonceId));
   }
   ```

   - **What this does**: If user is logged in, get their favorite listings
   - Used to show heart icon (❤️) on favorited listings

7. **Renders the page** (lines 134-198):

   ```typescript
   return (
     <main>
       {/* Mobile search form */}
       <FormSearchUI mobile />

       {/* Desktop layout */}
       <aside>
         <FormSearchUI /> {/* Sidebar search form */}
       </aside>

       <section>
         <ListAnnoncesUI
           annonces={annonces} // The listings to show
           favoriteIds={favoriteIds} // User's favorites
           totalPages={totalPages} // For pagination
         />
       </section>
     </main>
   );
   ```

   - **What renders**:
     - Search form (different layout for mobile vs desktop)
     - List of listings (6 per page)
     - Pagination controls (if more than 6 results)

**Real-world analogy:**

- `page.tsx` = The main page of a classified ads newspaper
- Search form = Filter section (category, price, location)
- Listings = The actual ads displayed
- Pagination = "Next page" button when there are many results

**Key takeaway:** This file runs on the **server** (not in browser), fetches data from MongoDB, processes it, and sends the final HTML to the user's browser. This is called **Server-Side Rendering (SSR)**.

### 4. **Middleware: `middleware.ts`**

- **Runs**: Before every request
- **What it does**:
  - Handles internationalization (i18n) routing
  - Protects routes (`/my/*`, `/admin/*`)
  - Redirects unauthenticated users to login
  - Processes locale from URL

#### 📖 **Beginner's Guide: Understanding `middleware.ts`**

Think of middleware as a **security guard** at the entrance of a building. Every request must pass through it before reaching your pages. It checks who you are and decides if you're allowed in.

**What happens step-by-step:**

1. **Every request goes through middleware first** (line 13):

   ```typescript
   export async function middleware(request: NextRequest) {
     const url = request.nextUrl.clone();
     const path = url.pathname;  // e.g., "/ar/my/list"
   ```

   - **When**: Before ANY page loads
   - Gets the URL path the user is trying to visit
   - Example: User visits `/ar/my/list` → `path = "/ar/my/list"`

2. **Skips certain files** (lines 16-19):

   ```typescript
   if (path === "/favicon.ico") {
     return NextResponse.next(); // Let it through, don't check
   }
   ```

   - **Why**: Favicon (website icon) doesn't need authentication
   - Just lets it pass through without checking

3. **Checks if user is logged in** (line 20):

   ```typescript
   const userData = await getUserFromCookies();
   ```

   - Looks for `jwt` cookie in the request
   - If cookie exists and is valid → `userData` = user info
   - If no cookie or invalid → `userData` = `null`

4. **Protects private routes** (lines 23-30):

   ```typescript
   // Check if trying to access protected area
   if (
     path.startsWith("/fr/my") ||
     path.startsWith("/ar/my") ||
     path.startsWith("/fr/admin")
   ) {
     if (!userData) {
       // Not logged in? Redirect to login page
       url.pathname = `/p/users/connexion`;
       return NextResponse.redirect(url);
     }
   }
   ```

   - **Protected routes**: `/my/*` (user's personal pages) and `/admin/*` (admin pages)
   - **Logic**:
     - If path starts with `/my` or `/admin` AND user is NOT logged in
     - → Redirect to login page (`/p/users/connexion`)
     - If user IS logged in → Let them through

5. **Handles language routing** (line 32):
   ```typescript
   return I18nMiddleware(request);
   ```
   - Processes the locale (`ar` or `fr`) from URL
   - Makes sure language is set correctly
   - Passes request to the actual page

**Configuration** (lines 35-37):

```typescript
export const config = {
  matcher: ["/((?!api|static|.*\\..*|_next|favicon.ico|robots.txt).*)"],
};
```

- **What this does**: Tells Next.js which URLs to run middleware on
- Excludes: API routes, static files, Next.js internal files
- Includes: All page routes

**Real-world flow example:**

```
User tries to visit: /ar/my/list
  ↓
Middleware intercepts
  ↓
Checks: Is path "/my/*"? YES
  ↓
Checks: Is user logged in?
  ↓
If NO → Redirect to: /p/users/connexion
If YES → Allow access → Continue to page
```

**Real-world analogy:**

- Middleware = Bouncer at a club entrance
- Checks your ID (JWT cookie) before letting you in
- Public areas (homepage) = Anyone can enter
- VIP area (`/my/*`) = Need valid ID (logged in)
- No ID? → Go to registration desk (login page)

**Key takeaway:** Middleware runs **before every page load** and acts as a gatekeeper, protecting private routes and handling language routing. It's the first line of defense for your application.

---

## 🔄 Application Flow

### **Request Flow:**

```
1. User visits URL (e.g., http://localhost:3000/ar)
   ↓
2. Middleware (middleware.ts) intercepts request
   ↓
   - Checks locale (ar/fr)
   - Checks authentication (JWT cookie)
   - Protects routes if needed
   ↓
3. Root Layout (app/[locale]/layout.tsx) renders
   ↓
   - Sets HTML lang and dir attributes
   - Loads i18n provider
   - Renders navigation
   ↓
4. Page Component (e.g., app/[locale]/page.tsx)
   ↓
   - Server-side data fetching from MongoDB
   - Processes search params
   - Renders UI components
   ↓
5. Response sent to browser
```

#### 📖 **Beginner's Guide: Understanding Request Flow**

This is the **complete journey** of a request from when a user clicks a link to when they see the page. Think of it like ordering food at a restaurant - there are several steps before you get your meal.

**Step-by-step breakdown:**

1. **User visits URL** (e.g., `http://localhost:3000/ar`):

   - User types URL in browser or clicks a link
   - Browser sends HTTP request to your server
   - **What happens**: Browser says "Hey server, I want to see `/ar` page!"

2. **Middleware intercepts** (`middleware.ts`):

   - **When**: Before ANY page loads
   - **What it does**:
     - Extracts locale from URL (`ar` or `fr`)
     - Checks for JWT cookie (is user logged in?)
     - If trying to access `/my/*` or `/admin/*`:
       - Not logged in? → Redirect to `/p/users/connexion`
       - Logged in? → Continue
   - **Why**: Security check - like a bouncer at a club entrance
   - **Result**: Request is either redirected OR allowed to continue

3. **Root Layout renders** (`app/[locale]/layout.tsx`):

   - **When**: After middleware allows the request
   - **What it does**:
     - Sets `<html lang="ar" dir="rtl">` (or `lang="fr" dir="ltr"`)
     - Loads Google Analytics scripts
     - Wraps app with translation providers
     - Renders navigation bar (different if logged in)
     - Prepares the HTML structure
   - **Why**: Every page needs the same HTML structure, language settings, and navigation
   - **Result**: HTML structure is ready, but page content is not yet filled

4. **Page Component runs** (`app/[locale]/page.tsx`):

   - **When**: After layout is set up
   - **What it does**:
     - Reads URL search params (e.g., `?categorieId=123&price=50000`)
     - Connects to MongoDB database
     - Builds query from search params
     - Fetches listings from database
     - Gets user favorites (if logged in)
     - Transforms data to match TypeScript types
     - Renders search form and listings
   - **Why**: This is where the actual page content comes from
   - **Result**: Complete HTML with all data

5. **Response sent to browser**:
   - **When**: After all processing is done
   - **What happens**:
     - Server sends complete HTML to browser
     - Browser receives the HTML
     - Browser renders the page (shows it to user)
     - User sees the page!
   - **Result**: User sees the homepage with listings

**Visual timeline:**

```
User clicks link
    ↓
Browser sends request
    ↓
Middleware checks (security guard)
    ↓
Layout sets up HTML structure (house frame)
    ↓
Page fetches data from database (furniture)
    ↓
Server sends complete HTML
    ↓
Browser renders page
    ↓
User sees the page! 🎉
```

**Real-world analogy:**

- **User visits URL** = Customer enters restaurant
- **Middleware** = Host checks reservation (are you allowed?)
- **Layout** = Restaurant sets up table, silverware, menu
- **Page Component** = Chef prepares your specific meal
- **Response** = Waiter brings your meal to the table

**Key takeaway:** Every request goes through these steps in order. Middleware is first (security), then Layout (structure), then Page (content), and finally the browser displays it to the user.

---

## 📁 Project Structure

```
rim-ebay-aut-2025-main/
│
├── app/[locale]/              # Main application (Next.js App Router)
│   ├── layout.tsx             # Root layout (entry point)
│   ├── page.tsx               # Homepage (listings page)
│   │
│   ├── api/                   # API routes (backend endpoints)
│   │   ├── my/annonces/       # User's listings API
│   │   ├── p/users/           # Auth API (login, register)
│   │   └── ...
│   │
│   ├── my/                    # Protected user pages
│   │   ├── add/               # Create new listing
│   │   ├── list/              # User's listings
│   │   └── details/           # Listing details
│   │
│   └── p/                     # Public pages
│       ├── users/             # Auth pages (login, register)
│       └── annonces/          # Public listing details
│
├── lib/                       # Core utilities
│   ├── mongodb.ts             # Database connection
│   └── mailer.ts              # Email service
│
├── middleware.ts              # Request interceptor
├── locales/                   # Translation files (i18n)
└── packages/                  # Shared packages
    ├── ui/                    # Reusable UI components
    └── mytypes/               # TypeScript types
```

---

## 🔑 Key Components

### **1. Database Connection (`lib/mongodb.ts`)**

```typescript
// Singleton pattern for MongoDB connection
- Reuses connection in development
- Creates new connection in production
- Exports getDb() function
```

#### 📖 **Beginner's Guide: Understanding Database Connection**

Think of the database connection as a **phone line** to your data storage. You want to reuse the same connection instead of creating a new one every time (which is slow and wasteful).

**What happens step-by-step:**

1. **Gets database URL from environment** (lines 3-4):

   ```typescript
   const uri = process.env.DATABASE_URL;
   if (!uri) throw new Error("Please add DATABASE_URL to your .env");
   ```

   - Reads database connection string from `.env` file
   - Example: `mongodb://localhost:27017/rim-ebay`
   - **Why**: Keeps sensitive info (like passwords) out of code
   - If missing, throws error (can't connect without it)

2. **Sets connection options** (lines 6-9):

   ```typescript
   const options = {
     serverSelectionTimeoutMS: 5000, // Wait 5 seconds max
     connectTimeoutMS: 8000, // Connect timeout 8 seconds
   };
   ```

   - **What this does**: Sets timeouts (how long to wait before giving up)
   - **Why**: Prevents hanging forever if database is down

3. **Singleton pattern for development** (lines 16-21):

   ```typescript
   if (process.env.NODE_ENV === "development") {
     if (!globalForMongo._mongoClientPromise) {
       client = new MongoClient(uri);
       globalForMongo._mongoClientPromise = client.connect();
     }
     clientPromise = globalForMongo._mongoClientPromise;
   }
   ```

   - **What this does**: In development, reuses the same connection
   - **Why**:
     - Creating new connections is slow
     - Reusing saves time and resources
     - Like keeping a phone line open instead of hanging up and calling again
   - **How**: Stores connection in global variable, reuses it

4. **New connection for production** (lines 22-25):

   ```typescript
   else {
     client = new MongoClient(uri, options);
     clientPromise = client.connect();
   }
   ```

   - **What this does**: In production, creates new connection each time
   - **Why**: Production servers handle connections differently
   - **How**: Creates fresh connection when needed

5. **Exports getDb() function** (lines 27-31):
   ```typescript
   export async function getDb(): Promise<Db> {
     const c = await clientPromise; // Wait for connection
     return c.db(); // Return database instance
   }
   ```
   - **What this does**: Returns the database instance
   - **How to use**:
     ```typescript
     const db = await getDb();
     const coll = db.collection("annonces");
     ```
   - **Why**: Provides easy way to access database from anywhere in your app

**Real-world analogy:**

- **Database connection** = Phone line to a library
- **Singleton pattern** = Keep the phone line open (don't hang up and call again)
- **getDb()** = Pick up the phone to talk to the library
- **Collections** = Different sections of the library (books, magazines, etc.)

**Key takeaway:** This file manages the connection to MongoDB. It reuses connections in development (faster) and provides a simple `getDb()` function that you can call from anywhere in your app to access the database.

### **2. Authentication (`utiles/getUserFomCookies.ts`)**

```typescript
// Reads JWT from cookies
- Verifies JWT token
- Extracts user data (id, email, role)
- Returns user object or null
```

#### 📖 **Beginner's Guide: Understanding Authentication**

Think of authentication as checking someone's **ID card**. When a user logs in, they get a JWT (JSON Web Token) cookie - like an ID card. This function checks if that ID card is valid and extracts the user's information.

**What happens step-by-step:**

1. **Gets cookies from request** (lines 7-8):

   ```typescript
   const cookieStore = await cookies();
   const jwtStore = cookieStore.get("jwt");
   ```

   - Reads all cookies from the request
   - Looks for cookie named `"jwt"`
   - **What is JWT?**: A secure token that proves the user is logged in
   - If no cookie → `jwtStore` = `undefined`

2. **Checks if JWT cookie exists** (line 10):

   ```typescript
   if (jwtStore) {
     // User has a JWT cookie, verify it
   }
   ```

   - If no cookie → return `null` (user not logged in)
   - If cookie exists → continue to verify it

3. **Verifies JWT token** (lines 11-16):

   ```typescript
   try {
     const secret = new TextEncoder().encode(process.env.JWT_SECRET);
     const token = jwtStore.value;
     const { payload } = await jwtVerify(token, secret);
   ```

   - **What this does**:
     - Gets secret key from environment variables
     - Verifies the JWT token is valid (not tampered with)
     - Extracts the payload (user data) from the token
   - **Why verify?**: Prevents fake tokens (security)
   - **How**: Uses secret key to verify token signature

4. **Extracts user data** (lines 22-27):

   ```typescript
   userData = {
     id: payload.id, // User's ID
     email: payload.email, // User's email
     role: payload.roleName, // User's role (admin, user, etc.)
     samsar: payload.samsar, // Is user a "samsar"?
   };
   ```

   - **What this does**: Extracts user information from token
   - **Why**: You need user info to check permissions, show personalized content, etc.
   - **Result**: Object with user data

5. **Handles errors** (lines 34-38):

   ```typescript
   catch (error) {
     console.log(`JWT verification failed: ${error.message}`);
     // Return null if verification fails
   }
   ```

   - **What this does**: If token is invalid (expired, tampered, etc.)
   - **Result**: Returns `null` (user not logged in)

6. **Returns result** (line 40):
   ```typescript
   return userData; // Returns user object OR null
   ```
   - **If logged in**: Returns `{ id, email, role, samsar }`
   - **If not logged in**: Returns `null`

**How to use this function:**

```typescript
// In any server component or API route
const user = await getUserFromCookies();

if (user) {
  // User is logged in
  console.log(`User ${user.email} is logged in`);
} else {
  // User is not logged in
  console.log("User is not logged in");
}
```

**Real-world analogy:**

- **JWT cookie** = ID card you get when you enter a building
- **getUserFromCookies()** = Security guard checking your ID card
- **Verification** = Guard checks if ID card is real (not fake)
- **Extract data** = Guard reads your name, ID number, etc. from the card
- **Return null** = ID card is fake or expired → not allowed in

**Key takeaway:** This function checks if a user is logged in by verifying their JWT cookie. If valid, it returns user data. If invalid or missing, it returns `null`. This is used throughout your app to check authentication status.

### **3. Internationalization**

- **Locales**: Arabic (`ar`) and French (`fr`)
- **Default**: Arabic
- **Middleware**: Handles locale routing
- **Translation files**: `locales/translations/ar.ts` and `fr.ts`

#### 📖 **Beginner's Guide: Understanding Internationalization (i18n)**

Think of internationalization as **translating your website** into different languages. Your app supports Arabic and French, so users can choose their preferred language.

**How it works:**

1. **URL structure**:

   - `/ar` = Arabic version
   - `/fr` = French version
   - **Why**: Language is part of the URL, so users can bookmark specific language versions

2. **Middleware extracts locale** (`middleware.ts`):

   ```typescript
   // User visits: /ar/my/list
   // Middleware extracts: locale = "ar"
   ```

   - **What happens**: Middleware reads the first part of the URL (`ar` or `fr`)
   - **Why**: Needs to know which language to use

3. **Layout sets language attributes** (`layout.tsx`):

   ```typescript
   <html lang={params.locale} dir={dir}>
   ```

   - **What this does**:
     - Sets `lang="ar"` or `lang="fr"` (tells browser the language)
     - Sets `dir="rtl"` for Arabic or `dir="ltr"` for French (text direction)
   - **Why**: Browser needs to know language and text direction

4. **Components use translations**:

   ```typescript
   // Server-side
   const t = await getI18n();
   const title = t("nav.Annoce"); // Gets translated text

   // Client-side
   const t = useI18n();
   const title = t("nav.Annoce"); // Gets translated text
   ```

   - **What this does**: Gets translated text from translation files
   - **How**: `t("nav.Annoce")` looks up the translation in the correct language file
   - **Result**: Returns text in user's selected language

5. **Translation files**:

   - `locales/translations/ar.ts` = Arabic translations
   - `locales/translations/fr.ts` = French translations
   - **Structure**:

     ```typescript
     // ar.ts
     export default {
       nav: {
         Annoce: "إعلانات", // Arabic text
       },
     };

     // fr.ts
     export default {
       nav: {
         Annoce: "Annonces", // French text
       },
     };
     ```

**Real-world analogy:**

- **Internationalization** = Having a bilingual menu at a restaurant
- **URL locale** = Choosing which menu to read (Arabic or French)
- **Translation files** = The actual translations (Arabic menu vs French menu)
- **t() function** = Asking the waiter "What does this say?" in your language

**Key takeaway:** Your app supports multiple languages by using the URL to determine the language, setting HTML attributes accordingly, and using translation files to display text in the correct language.

### **4. Route Protection**

- **Protected routes**: `/my/*`, `/admin/*`
- **Middleware checks**: JWT cookie exists
- **Redirect**: Unauthenticated → `/p/users/connexion`

#### 📖 **Beginner's Guide: Understanding Route Protection**

Think of route protection as **locked doors** in a building. Some areas are public (anyone can enter), but some areas require a key (you must be logged in).

**How it works:**

1. **Protected routes**:

   - `/my/*` = User's personal pages (my listings, my account, etc.)
   - `/admin/*` = Admin pages (only admins can access)
   - **Why**: These pages contain private information, so only logged-in users should access them

2. **Middleware checks authentication** (`middleware.ts`):

   ```typescript
   // User tries to visit: /ar/my/list
   if (path.startsWith("/ar/my") || path.startsWith("/fr/my")) {
     if (!userData) {
       // Not logged in? Redirect to login
       url.pathname = `/p/users/connexion`;
       return NextResponse.redirect(url);
     }
   }
   ```

   - **What happens**:
     - User tries to access `/my/*` or `/admin/*`
     - Middleware checks: Is user logged in? (has JWT cookie?)
     - If NOT logged in → Redirect to login page (`/p/users/connexion`)
     - If logged in → Allow access

3. **Public routes**:
   - `/` = Homepage (anyone can access)
   - `/p/*` = Public pages (anyone can access)
   - **Why**: These pages don't need authentication

**Real-world flow example:**

```
User tries to visit: /ar/my/list
  ↓
Middleware intercepts
  ↓
Checks: Is path "/my/*"? YES
  ↓
Checks: Is user logged in?
  ↓
If NO → Redirect to: /p/users/connexion
If YES → Allow access → Show page
```

**Real-world analogy:**

- **Public routes** = Lobby of a building (anyone can enter)
- **Protected routes** = Private offices (need key card to enter)
- **Middleware** = Security guard checking your key card
- **JWT cookie** = Your key card (proves you're allowed in)
- **Redirect** = Security guard says "You need a key card, go to the registration desk first"

**Key takeaway:** Route protection ensures that only logged-in users can access private pages. If someone tries to access a protected route without being logged in, they're automatically redirected to the login page.

---

## 📊 Data Flow Example: Homepage

### **Step-by-Step:**

1. **User visits**: `http://localhost:3000/ar?categorieId=123&price=50000`

2. **Middleware processes**:

   - Extracts locale: `ar`
   - No auth needed for homepage
   - Passes to i18n middleware

3. **Layout renders**:

   - Sets `dir="rtl"` (Arabic)
   - Loads Arabic translations
   - Checks for JWT cookie
   - Renders navigation

4. **Page component (`app/[locale]/page.tsx`)**:

   ```typescript
   - Reads searchParams: { categorieId: "123", price: "50000" }
   - Connects to MongoDB: getDb()
   - Builds query: {
       status: "active",
       isPublished: true,
       categorieId: "123",
       price: 50000
     }
   - Fetches: coll.find(query).sort().skip().limit()
   - Gets user favorites (if logged in)
   - Maps data to Annonce[] type
   - Renders: FormSearchUI + ListAnnoncesUI
   ```

5. **Response**:
   - HTML with listings
   - Search form with filters
   - Pagination controls

#### 📖 **Beginner's Guide: Understanding Data Flow Example**

This is a **real example** of what happens when a user searches for listings. Let's break down each step in detail.

**Step 1: User visits URL**

```
http://localhost:3000/ar?categorieId=123&price=50000
```

- **What this means**:
  - `/ar` = Arabic language version
  - `?categorieId=123` = Filter by category ID 123
  - `&price=50000` = Filter by price 50000
- **Why**: User is searching for listings in category 123 with price 50000

**Step 2: Middleware processes**

- **What happens**:
  - Extracts locale: `ar` (Arabic)
  - Checks if homepage needs auth (it doesn't - homepage is public)
  - Passes request to i18n middleware
- **Result**: Request is allowed to continue

**Step 3: Layout renders**

- **What happens**:
  - Sets `dir="rtl"` (right-to-left for Arabic)
  - Loads Arabic translations from `locales/translations/ar.ts`
  - Checks for JWT cookie (is user logged in?)
  - Renders navigation bar (different items if logged in)
- **Result**: HTML structure is ready with Arabic language settings

**Step 4: Page component runs**

- **What happens**:

  1. **Reads search params**:

     ```typescript
     searchParams = { categorieId: "123", price: "50000" };
     ```

     - Extracts filters from URL

  2. **Connects to MongoDB**:

     ```typescript
     const db = await getDb();
     ```

     - Gets database connection

  3. **Builds query**:

     ```typescript
     query = {
       status: "active", // Only active listings
       isPublished: true, // Only published listings
       categorieId: "123", // Category filter
       price: 50000, // Price filter
     };
     ```

     - Combines base filters with user's search filters

  4. **Fetches from database**:

     ```typescript
     coll
       .find(query)
       .sort({ isSponsored: -1, updatedAt: -1 }) // Sponsored first, then newest
       .skip(0) // Start from beginning
       .limit(6) // Get 6 items
       .toArray();
     ```

     - Finds listings matching the query
     - Sorts: sponsored listings first, then by date (newest first)
     - Gets first 6 items (page 1)

  5. **Gets user favorites** (if logged in):

     ```typescript
     if (user?.id) {
       const favs = await db
         .collection("favorites")
         .find({ userId: user.id })
         .toArray();
     }
     ```

     - If user is logged in, get their favorite listing IDs
     - Used to show heart icon (❤️) on favorited listings

  6. **Maps data**:

     ```typescript
     annonces = rows.map((a) => ({
       id: String(a._id),
       title: a.title,
       price: Number(a.price),
       // ... more fields
     }));
     ```

     - Converts MongoDB format to your app's format
     - MongoDB uses `_id`, your app uses `id`

  7. **Renders UI**:
     ```typescript
     <FormSearchUI />      // Search form
     <ListAnnoncesUI       // Listings display
       annonces={annonces}
       favoriteIds={favoriteIds}
     />
     ```
     - Renders search form with current filters
     - Renders list of listings (6 items)

**Step 5: Response sent to browser**

- **What happens**:
  - Server sends complete HTML to browser
  - HTML includes:
    - Search form with filters pre-filled
    - List of 6 listings matching the search
    - Pagination controls (if more than 6 results)
  - Browser renders the page
  - User sees the search results!

**Real-world analogy:**

- **User visits URL** = Customer asks "Show me cars under 50000"
- **Middleware** = Host checks if customer is allowed (yes, homepage is public)
- **Layout** = Restaurant sets up table with Arabic menu
- **Page component** = Chef searches kitchen for matching dishes (listings)
- **Database query** = Chef looks in specific category, specific price range
- **Response** = Waiter brings matching dishes to the table

**Key takeaway:** This example shows the complete flow from URL to displayed results. The user's search filters (category, price) are extracted from the URL, used to query the database, and the matching listings are displayed on the page.

---

## 🔌 API Routes Structure

### **Authentication APIs:**

- `POST /api/p/users/register` - Register new user
- `POST /api/p/users/connexion` - Login
- `POST /api/p/users/logout` - Logout
- `POST /api/p/users/forgot-password` - Password reset

### **Listing APIs:**

- `GET /api/my/annonces` - Get user's listings
- `POST /api/my/annonces` - Create new listing
- `GET /api/my/annonces/[id]` - Get listing details
- `POST /api/my/annonces/[id]/favorite` - Toggle favorite

### **Data APIs:**

- `GET /api/p/api/tursor/options` - Get categories/options
- `GET /api/p/api/tursor/lieux` - Get locations (Wilaya/Moughataa)

---

## 🗄️ Database Structure

### **Main Collections:**

- `users` - User accounts
- `annonces` - Listings (ads)
- `favorites` - User favorites
- `options` - Categories, types, etc.
- `images` - Image metadata
- `contacts` - User contact info
- `user_sessions` - Active sessions

### **Connection:**

- **URI**: `mongodb://localhost:27017/rim-ebay` (from `.env`)
- **Connection**: Singleton pattern in `lib/mongodb.ts`
- **Database name**: `rim-ebay`

---

## 🎯 How It Works: Complete Example

### **Scenario: User searches for cars in Nouakchott**

1. **User action**:

   - Visits `/ar`
   - Fills search form: Category="Voitures", Location="Nouakchott"
   - Clicks "Search"

2. **URL changes**:

   ```
   /ar?categorieId=car123&wilayaId=nkc123
   ```

3. **Server-side (page.tsx)**:

   ```typescript
   // Reads URL params
   const sp = await searchParams;
   // sp = { categorieId: "car123", wilayaId: "nkc123" }

   // Builds MongoDB query
   const query = {
     status: "active",
     isPublished: true,
     categorieId: "car123",
     lieuId: "nkc123",
   };

   // Fetches from database
   const annonces = await db
     .collection("annonces")
     .find(query)
     .sort({ isSponsored: -1, updatedAt: -1 })
     .skip(0)
     .limit(6)
     .toArray();
   ```

4. **Response**:
   - Renders listings matching criteria
   - Shows pagination if > 6 results
   - Updates search form with selected filters

---

## 🔐 Authentication Flow

### **Login Process:**

1. **User submits form** → `POST /api/p/users/connexion`
2. **API verifies** credentials in MongoDB
3. **If valid**:
   - Creates JWT token
   - Sets cookie: `jwt=<token>`
   - Returns success
4. **Middleware** reads cookie on next request
5. **Protected routes** now accessible

#### 📖 **Beginner's Guide: Understanding Authentication Flow**

This is the **complete process** of how a user logs in and how the app remembers they're logged in. Think of it like getting a membership card at a gym - you show your ID, they give you a card, and you use that card to access the gym.

**Login Process (Step-by-Step):**

1. **User submits login form**:

   - User enters email and password
   - Clicks "Login" button
   - Form sends `POST /api/p/users/connexion` request
   - **What happens**: Browser sends email and password to server

2. **API verifies credentials** (`/api/p/users/connexion`):

   ```typescript
   // API route receives email and password
   // 1. Finds user in MongoDB
   const user = await db.collection("users").findOne({ email });

   // 2. Checks if password is correct
   const isValid = await bcrypt.compare(password, user.password);

   // 3. If valid, create JWT token
   if (isValid) {
     const token = jwt.sign(
       { id: user._id, email: user.email, role: user.role },
       process.env.JWT_SECRET
     );
   }
   ```

   - **What happens**:
     - Server looks up user in database by email
     - Compares entered password with stored password (using bcrypt)
     - If password matches → create JWT token
     - If password doesn't match → return error

3. **If valid, create JWT token**:

   ```typescript
   const token = jwt.sign(
     {
       id: user._id, // User's ID
       email: user.email, // User's email
       role: user.role, // User's role
     },
     process.env.JWT_SECRET // Secret key to sign token
   );
   ```

   - **What is JWT?**: A secure token that contains user information
   - **Why use JWT?**: Proves user is logged in without storing session in database
   - **How**: Token is signed with secret key (can't be tampered with)

4. **Set cookie**:

   ```typescript
   response.cookies.set("jwt", token, {
     httpOnly: true, // Can't be accessed by JavaScript (security)
     secure: true, // Only sent over HTTPS (security)
     maxAge: 60 * 60 * 24 * 7, // Expires in 7 days
   });
   ```

   - **What happens**: Server sends cookie to browser
   - **Why**: Browser stores cookie, sends it with every request
   - **Result**: User is now "logged in" (has JWT cookie)

5. **Middleware reads cookie on next request**:

   ```typescript
   // User visits: /ar/my/list
   // Middleware checks: Does JWT cookie exist?
   const userData = await getUserFromCookies();

   if (userData) {
     // User is logged in, allow access
   } else {
     // User is not logged in, redirect to login
   }
   ```

   - **What happens**: Every request includes the JWT cookie
   - **Why**: Middleware can check if user is logged in
   - **Result**: Protected routes are now accessible

**Protected Route Access Flow:**

```
User visits: /ar/my/list
  ↓
Middleware intercepts request
  ↓
Checks: Does JWT cookie exist?
  ↓
If NO → Redirect to: /p/users/connexion
  ↓
If YES → Verify JWT token
  ↓
If valid → Allow access → Render page
  ↓
If invalid → Redirect to: /p/users/connexion
```

**Real-world analogy:**

- **Login form** = Showing your ID at the gym front desk
- **API verifies** = Front desk checks if you're a member
- **JWT token** = Membership card with your info
- **Cookie** = Card stored in your wallet (browser)
- **Middleware** = Security guard checking your card at the door
- **Protected routes** = Members-only areas (need card to enter)

**Key takeaway:** When a user logs in, they get a JWT cookie that proves they're logged in. This cookie is sent with every request, allowing the app to check authentication status and protect private routes.

---

## 🌐 Internationalization (i18n)

### **How it works:**

1. **URL structure**: `/{locale}/...`

   - `/ar` = Arabic
   - `/fr` = French

2. **Middleware** extracts locale from URL

3. **Layout** sets:

   - `lang={locale}` attribute
   - `dir={rtl|ltr}` for text direction

4. **Components** use:

   ```typescript
   const t = useI18n(); // Client-side
   const t = await getI18n(); // Server-side
   t("nav.Annoce"); // Gets translated text
   ```

5. **Translation files**:
   - `locales/translations/ar.ts`
   - `locales/translations/fr.ts`

---

## 🎨 UI Rendering

### **Server Components vs Client Components:**

- **Server Components** (default):

  - `app/[locale]/page.tsx` - Fetches data, renders HTML
  - Can access database directly
  - No JavaScript sent to browser

- **Client Components** (`"use client"`):
  - Interactive components (forms, buttons)
  - Use React hooks
  - JavaScript sent to browser

### **Example:**

```typescript
// Server Component (page.tsx)
export default async function Home() {
  const db = await getDb(); // ✅ Can access DB
  const data = await db.collection("annonces").find().toArray();
  return <ListAnnoncesUI data={data} />;
}

// Client Component (ListAnnoncesUI.tsx)
("use client");
export default function ListAnnoncesUI({ data }) {
  const [favorites, setFavorites] = useState([]); // ✅ Can use hooks
  return <div>...</div>;
}
```

#### 📖 **Beginner's Guide: Understanding Server vs Client Components**

This is a **fundamental concept** in Next.js. There are two types of components: Server Components (run on server) and Client Components (run in browser). Understanding the difference is crucial!

**Server Components (Default):**

1. **What they are**:

   - Components that run on the **server** (not in browser)
   - Default in Next.js - you don't need to mark them
   - **Example**: `app/[locale]/page.tsx`

2. **What they can do**:

   ```typescript
   // ✅ CAN do:
   export default async function Home() {
     const db = await getDb(); // Access database
     const data = await db.collection("annonces").find().toArray(); // Fetch data
     return <div>{data.title}</div>; // Render HTML
   }
   ```

   - ✅ Access database directly
   - ✅ Read files from filesystem
   - ✅ Use environment variables
   - ✅ Fetch data from APIs
   - ✅ Render HTML on server

3. **What they CANNOT do**:

   ```typescript
   // ❌ CANNOT do:
   export default function Home() {
     const [count, setCount] = useState(0); // ❌ No hooks!
     const handleClick = () => {}; // ❌ No event handlers!
     return <button onClick={handleClick}>Click</button>; // ❌ No interactivity!
   }
   ```

   - ❌ Cannot use React hooks (`useState`, `useEffect`, etc.)
   - ❌ Cannot handle user interactions (clicks, form submissions)
   - ❌ Cannot use browser APIs (localStorage, window, etc.)

4. **Why use Server Components?**:
   - **Faster**: Data fetching happens on server (closer to database)
   - **Secure**: Sensitive code (database passwords) never sent to browser
   - **Smaller bundle**: No JavaScript sent to browser (faster page load)
   - **SEO friendly**: HTML is ready when page loads (search engines can read it)

**Client Components (`"use client"`):**

1. **What they are**:

   - Components that run in the **browser** (user's computer)
   - Must be marked with `"use client"` at the top
   - **Example**: Interactive forms, buttons, dropdowns

2. **What they can do**:

   ```typescript
   "use client"; // Must mark as client component

   export default function SearchForm() {
     const [query, setQuery] = useState(""); // ✅ Can use hooks

     const handleSubmit = (e) => {
       // ✅ Can handle events
       e.preventDefault();
       // Do something
     };

     return (
       <form onSubmit={handleSubmit}>
         <input
           value={query}
           onChange={(e) => setQuery(e.target.value)} // ✅ Interactive
         />
         <button type="submit">Search</button>
       </form>
     );
   }
   ```

   - ✅ Can use React hooks (`useState`, `useEffect`, `useContext`, etc.)
   - ✅ Can handle user interactions (clicks, form submissions, etc.)
   - ✅ Can use browser APIs (localStorage, window, document, etc.)
   - ✅ Can be interactive (buttons, forms, dropdowns, etc.)

3. **What they CANNOT do**:

   ```typescript
   // ❌ CANNOT do:
   "use client";
   export default function Home() {
     const db = await getDb(); // ❌ No database access!
     const data = await db.collection("annonces").find().toArray(); // ❌ No direct DB!
   }
   ```

   - ❌ Cannot access database directly
   - ❌ Cannot read files from filesystem
   - ❌ Cannot use server-only APIs

4. **Why use Client Components?**:
   - **Interactive**: Can respond to user actions (clicks, typing, etc.)
   - **Dynamic**: Can update UI based on user input
   - **Browser APIs**: Can use browser features (localStorage, geolocation, etc.)

**How to decide which to use:**

- **Use Server Component when**:

  - Fetching data from database
  - Rendering static content
  - No user interaction needed
  - Example: `page.tsx` that fetches listings

- **Use Client Component when**:
  - Need user interaction (buttons, forms)
  - Need React hooks (`useState`, `useEffect`)
  - Need browser APIs (localStorage, etc.)
  - Example: Search form, favorite button, dropdown menu

**Real-world analogy:**

- **Server Component** = Chef in kitchen (prepares food before serving)

  - Works in kitchen (server)
  - Has access to ingredients (database)
  - Prepares food (renders HTML)
  - Sends finished food to customer (browser)

- **Client Component** = Waiter at table (interacts with customer)
  - Works at table (browser)
  - Interacts with customer (user)
  - Takes orders (handles clicks, form submissions)
  - Updates order (changes UI based on user input)

**Key takeaway:** Server Components are for data fetching and static rendering (faster, more secure). Client Components are for interactivity (buttons, forms, dynamic UI). Use Server Components by default, and only use Client Components when you need interactivity.

---

## 🧾 Register Flow (`RegisterForm.tsx`)

### 🚦 High-Level Overview

- **Location**: `app/[locale]/p/users/register/RegisterForm.tsx`
- **Type**: Client component (`"use client"`) → runs in the browser
- **Purpose**: Collect user info, validate it, call the registration API, then redirect to verification page

### 🧱 Component Structure

```typescript
"use client";

export default function RegisterForm({ lang = "ar", urlboot }) {
  const router = useRouter();        // navigation + refresh
  const t = useI18n();               // translations
  // ... state hooks
  const validateForm = () => { ... } // local validation
  const handleSubmit = async (event) => { ... } // API call + redirect

  return (
    <main>
      <form onSubmit={handleSubmit}>
        {/* inputs + radio buttons + submit */}
      </form>
    </main>
  );
}
```

### 🔄 Step-by-Step Flow

#### 1. **Component mounts**

```typescript
const router = useRouter(); // enables redirect/refresh
const t = useI18n(); // pulls locale-aware text
```

- `lang` prop defaults to `"ar"`; determines which locale API route to call.
- `urlboot` prop used for the external notification webhook.

#### 2. **Local state initialisation**

```typescript
const [samsar, setSamsar] = useState(false);          // radio toggle
const [email, setEmail] = useState("");               // input value
const [contact, setContact] = useState("");           // phone number
const [password, setPassword] = useState("");         // password field
const [confirmPassword, setConfirmPassword] = useState("");
const [errors, setErrors] = useState({ ... });        // validation messages
const [submitStatus, setSubmitStatus] = useState(""); // success/error banner
const [isLoading, setIsLoading] = useState(false);    // disables inputs
```

- Each input is fully controlled (value driven by state).
- `errors` mirrors the inputs, making it easy to show inline messages.

#### 3. **Form validation (`validateForm`)**

```typescript
if (!email) newErrors.email = t("register.emailRequired");
else if (!/\S+@\S+\.\S+/.test(email))
  newErrors.email = t("register.emailInvalid");

if (!password) newErrors.password = t("register.passwordRequired");
else if (password.length < 6)
  newErrors.password = t("register.passwordMinLength");

if (password !== confirmPassword)
  newErrors.confirmPassword = t("register.passwordsNotMatch");
```

- Returns `true` only if all checks pass.
- Updates the `errors` state so the UI shows translated hints below each field.

#### 4. **Submit handler (`handleSubmit`)**

```typescript
event.preventDefault();
if (!validateForm()) return;

setIsLoading(true);
try {
  const response = await axios.post(`/${lang}/api/p/users/register`, {
    email,
    contact,
    password,
    samsar,
  });

  await fetch(
    `${urlboot}?msg=https://admin-rim.vercel.app/users/${response.data.user.id}`
  );

  setSubmitStatus(t("register.success"));
  router.push(`/${lang}/p/verification`);
  router.refresh();
} catch (error: any) {
  setSubmitStatus(error.response?.data?.error || t("nav.labo"));
} finally {
  setIsLoading(false);
}
```

- **API call**: `axios.post` hits locale-specific register endpoint.
- **Webhook**: `fetch(urlboot)` notifies an external service with the new user ID.
- **Success**: show success message, redirect to verification page, refresh router cache.
- **Failure**: show API error (or fallback translation).
- **Cleanup**: always reset `isLoading`.

#### 5. **UI rendering**

- `<main>` wrapper uses Tailwind gradients for background.
- Form uses Tailwind spacing (`space-y-4`) for layout.
- Each field:
  - `input` bound to state (`value` + `onChange`).
  - `disabled={isLoading}` prevents edits while submitting.
  - Required attribute for basic browser validation.
  - Error message `<p>` rendered conditionally from `errors`.
- Radio buttons toggle `samsar` boolean to distinguish `particulier` vs `samsar`.
- Submit button:
  - Shows spinner text via translation when `isLoading`.
  - Applies disabled styling via Tailwind classes.
- Status message (`submitStatus`) renders below button with green/red tint.

### 🧠 Key Concepts & Tips

- **Translations**: Every label and message pulled from `t(...)`, keeping the form locale-aware.
- **Client component**: Needed because it uses React state, event handlers, and browser APIs (`fetch`, `axios`).
- **Data flow**:
  1. User fills fields → updates state via `onChange`.
  2. `handleSubmit` validates → posts to API.
  3. On success → external webhook → redirect to verification page.
- **Error handling**: Prefers API error message but falls back to translation key `nav.labo`.
- **Extensibility**: To add more fields, copy the pattern (state + validation + UI block).

### ✅ Verification Checklist

- [ ] Do translations exist for all keys (`register.*`, `nav.labo`)?
- [ ] Does `.env` specify the same `lang` prefix APIs expect?
- [ ] Is `urlboot` provided when rendering `RegisterForm`?
- [ ] Are password rules aligned with backend requirements?
- [ ] Is HTTPS enforced for production (`secure: true`) when cookies are set by API?

---

## 📝 Summary

**Entry Points:**

1. `package.json` → `pnpm run dev` starts server
2. `middleware.ts` → Intercepts all requests
3. `app/[locale]/layout.tsx` → Root layout
4. `app/[locale]/page.tsx` → Homepage

**How It Works:**

- Next.js App Router with server-side rendering
- MongoDB for data storage
- JWT cookies for authentication
- i18n for Arabic/French support
- Server Components for data fetching
- Client Components for interactivity

**Key Flow:**

```
Request → Middleware → Layout → Page → Database → Response
```
