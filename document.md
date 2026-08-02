# Future Card — Project Specification

SaaS web application for creating and managing digital visiting cards (vkard-style).

**Stack:** Next.js (App Router) · Tailwind CSS · MongoDB / Mongoose · NextAuth · Zod · Shadcn/ui · UploadThing

---

## 1. Project Structure

```
FUTURE CARD/
├── .env.local
├── .env.example
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
│
├── public/
│   ├── favicon.ico
│   ├── og-image.png
│   └── default-cover.jpg
│
├── src/
│   ├── app/                              # Next.js App Router
│   │   ├── layout.tsx                    # Root layout with providers
│   │   ├── page.tsx                      # Landing page
│   │   ├── (auth)/                       # Auth route group
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (dashboard)/                  # Protected dashboard group
│   │   │   ├── layout.tsx                # Dashboard shell + sidebar
│   │   │   ├── dashboard/page.tsx        # User dashboard overview
│   │   │   ├── cards/
│   │   │   │   ├── page.tsx              # All cards listing
│   │   │   │   ├── create/page.tsx       # Card builder wizard
│   │   │   │   └── [cardId]/
│   │   │   │       ├── edit/page.tsx     # Card editor
│   │   │   │       └── preview/page.tsx  # Card preview
│   │   │   ├── analytics/page.tsx        # Analytics dashboard
│   │   │   └── settings/page.tsx         # Account settings
│   │   ├── (admin)/                      # Super Admin route group
│   │   │   ├── layout.tsx
│   │   │   ├── admin/dashboard/page.tsx
│   │   │   ├── admin/users/page.tsx
│   │   │   ├── admin/users/create/page.tsx
│   │   │   └── admin/subscriptions/page.tsx
│   │   ├── api/                          # API routes
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── cards/
│   │   │   │   ├── route.ts              # GET (list), POST (create)
│   │   │   │   └── [cardId]/route.ts     # GET, PUT, DELETE
│   │   │   ├── users/
│   │   │   │   ├── route.ts              # GET (list), POST (create user)
│   │   │   │   └── [userId]/route.ts     # GET, PUT, DELETE
│   │   │   ├── subscriptions/route.ts
│   │   │   ├── analytics/
│   │   │   │   └── [cardId]/route.ts     # GET card analytics
│   │   │   └── upload/route.ts           # File upload endpoint
│   │   └── [username]/page.tsx           # Public card view (vanity URL)
│   │
│   ├── components/
│   │   ├── ui/                           # Shadcn/ui base components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── form.tsx
│   │   │   ├── input.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── table.tsx
│   │   │   └── toast.tsx
│   │   ├── shared/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── ConfirmDialog.tsx
│   │   │   ├── StatCard.tsx
│   │   │   └── PageHeader.tsx
│   │   ├── cards/
│   │   │   ├── CardPreview.tsx           # Live card renderer
│   │   │   ├── CardTemplate.tsx          # Template wrapper
│   │   │   ├── CardShareModal.tsx        # Share options modal
│   │   │   ├── CardAnalytics.tsx         # Analytics display
│   │   │   ├── BusinessHours.tsx         # Operating hours widget
│   │   │   ├── SocialLinks.tsx           # Social media links
│   │   │   ├── ContactButtons.tsx        # Call / WhatsApp / Email
│   │   │   └── SaveContact.tsx           # vCard download button
│   │   ├── forms/
│   │   │   ├── CardBuilderForm.tsx       # Multi-step card creation
│   │   │   ├── ProfileForm.tsx
│   │   │   ├── BusinessInfoForm.tsx
│   │   │   ├── SocialLinksForm.tsx
│   │   │   ├── BusinessHoursForm.tsx
│   │   │   └── ImageUpload.tsx           # Drag-and-drop uploader
│   │   ├── dashboard/
│   │   │   ├── OverviewStats.tsx
│   │   │   ├── RecentCards.tsx
│   │   │   ├── EngagementChart.tsx
│   │   │   └── QuickActions.tsx
│   │   └── admin/
│   │       ├── AdminSidebar.tsx
│   │       ├── UserTable.tsx
│   │       ├── SubscriptionManager.tsx
│   │       ├── CreateUserModal.tsx
│   │       └── SystemStats.tsx
│   │
│   ├── lib/
│   │   ├── db.ts                         # MongoDB connection singleton
│   │   ├── auth.ts                       # NextAuth configuration
│   │   ├── validations.ts                # Zod schemas
│   │   ├── constants.ts                  # App-wide constants
│   │   ├── utils.ts                      # Helper functions
│   │   ├── vcard-generator.ts            # vCard file generation
│   │   ├── analytics-tracker.ts          # View / click / action tracking
│   │   └── api-client.ts                 # React Query API wrapper
│   │
│   ├── models/                           # Mongoose models
│   │   ├── User.ts
│   │   ├── Card.ts
│   │   ├── Subscription.ts
│   │   └── Analytics.ts
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useCards.ts
│   │   ├── useAnalytics.ts
│   │   ├── useSubscription.ts
│   │   └── useDebounce.ts
│   │
│   ├── providers/
│   │   ├── AuthProvider.tsx
│   │   ├── QueryProvider.tsx
│   │   └── ThemeProvider.tsx
│   │
│   ├── middleware.ts                     # Route protection
│   │
│   └── types/
│       ├── card.types.ts
│       ├── user.types.ts
│       ├── subscription.types.ts
│       └── analytics.types.ts
```

---

## 2. Database Models (MongoDB / Mongoose)

### 2.1 User

| Field       | Type     | Rules                                      |
|-------------|----------|--------------------------------------------|
| `_id`       | ObjectId | Auto                                       |
| `name`      | String   | Required                                   |
| `email`     | String   | Required, unique, lowercase                |
| `password`  | String   | Required, hashed with bcrypt               |
| `role`      | String   | Enum: `user` \| `admin`, default: `user`   |
| `avatar`    | String   | URL                                        |
| `isActive`  | Boolean  | Default: `true`                            |
| `createdAt` | Date     | Auto                                       |
| `updatedAt` | Date     | Auto                                       |

### 2.2 Card

| Field             | Type     | Rules                                                                 |
|-------------------|----------|-----------------------------------------------------------------------|
| `_id`             | ObjectId | Auto                                                                  |
| `userId`          | ObjectId | Ref: User, required                                                   |
| `username`        | String   | Required, unique — vanity URL: `/[username]`                          |
| `profileImage`    | String   | URL                                                                   |
| `coverImage`      | String   | URL                                                                   |
| `companyName`     | String   | Required                                                              |
| `jobTitle`        | String   | Required                                                              |
| `businessCategory`| String   | Optional                                                              |
| `aboutUs`         | String   | Max 500 characters                                                    |
| `gstNumber`       | String   | Optional                                                              |
| `email`           | String   | Optional                                                              |
| `phone`           | String   | Optional                                                              |
| `whatsappNumber`  | String   | Optional                                                              |
| `website`         | String   | URL                                                                   |
| `socialLinks`     | Object   | See below                                                             |
| `location`        | Object   | See below                                                             |
| `businessHours`   | Array    | See below                                                             |
| `isActive`        | Boolean  | Default: `true`                                                       |
| `template`        | String   | Default: `classic` (future multi-template support)                    |
| `createdAt`       | Date     | Auto                                                                  |
| `updatedAt`       | Date     | Auto                                                                  |

**`socialLinks`**

```ts
{
  facebook?: string;
  instagram?: string;
  youtube?: string;
  linkedin?: string;
  twitter?: string;
  other?: string;
}
```

**`location`**

```ts
{
  address?: string;
  googleMapsUrl?: string;
  latitude?: number;
  longitude?: number;
}
```

**`businessHours[]`**

```ts
{
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  isOpen: boolean;
  openTime: string;   // "HH:MM"
  closeTime: string;  // "HH:MM"
}
```

### 2.3 Subscription

| Field           | Type     | Rules                                                           |
|-----------------|----------|-----------------------------------------------------------------|
| `_id`           | ObjectId | Auto                                                            |
| `userId`        | ObjectId | Ref: User, required, unique                                     |
| `plan`          | String   | Enum: `free` \| `basic` \| `premium`, default: `free`           |
| `startDate`     | Date     | Required                                                        |
| `endDate`       | Date     | Required                                                        |
| `isActive`      | Boolean  | Default: `true`                                                 |
| `autoRenew`     | Boolean  | Default: `false`                                                |
| `paymentStatus` | String   | Enum: `pending` \| `paid` \| `expired` \| `cancelled`           |
| `amount`        | Number   | Optional                                                        |
| `createdAt`     | Date     | Auto                                                            |
| `updatedAt`     | Date     | Auto                                                            |

### 2.4 Analytics

| Field         | Type     | Rules                                                                      |
|---------------|----------|----------------------------------------------------------------------------|
| `_id`         | ObjectId | Auto                                                                       |
| `cardId`      | ObjectId | Ref: Card, required                                                        |
| `eventType`   | String   | Enum: `view` \| `click` \| `action` \| `share` \| `save_contact`           |
| `eventDetail` | String   | e.g. `whatsapp_click`, `call_click`, `email_click`                         |
| `ipAddress`   | String   | Optional                                                                   |
| `userAgent`   | String   | Optional                                                                   |
| `referrer`    | String   | Optional                                                                   |
| `createdAt`   | Date     | Auto                                                                       |

**Indexes**

- `{ cardId: 1, createdAt: -1 }`
- `{ cardId: 1, eventType: 1 }`

---

## 3. vCard Export Format

Generated by `lib/vcard-generator.ts` for the **Save Contact** action:

```
BEGIN:VCARD
VERSION:3.0
FN:[Full Name]
ORG:[Company Name]
TITLE:[Job Title]
TEL:[Phone]
EMAIL:[Email]
URL:[Website]
ADR:[Address]
PHOTO:[Profile Image URL]
END:VCARD
```

---

## 4. Coding Conventions

### 4.1 React Component Pattern

```tsx
// 1. Imports
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { type ICard } from '@/types/card.types';

// 2. Props interface
interface CardPreviewProps {
  card: ICard;
  className?: string;
  onShare?: () => void;
}

// 3. Component
export const CardPreview = ({ card, className, onShare }: CardPreviewProps) => {
  // 4. Hooks (state, queries, custom hooks)
  const [isExpanded, setIsExpanded] = useState(false);

  // 5. Derived state / computed values
  const fullName = `${card.firstName} ${card.lastName}`;

  // 6. Event handlers
  const handleShare = () => {
    onShare?.();
  };

  // 7. Render
  return (
    <div className={cn('rounded-lg p-4', className)}>
      {/* JSX */}
    </div>
  );
};
```

### 4.2 API Route Pattern

```tsx
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { dbConnect } from '@/lib/db';
import { Card } from '@/models/Card';
import { authOptions } from '@/lib/auth';

// 1. Validation schema
const createCardSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-z0-9_]+$/),
  companyName: z.string().min(1).max(100),
  jobTitle: z.string().min(1).max(100),
  // ... other fields
});

// 2. Route handler
export async function POST(req: NextRequest) {
  try {
    // 3. Auth check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 4. Parse and validate body
    const body = await req.json();
    const validatedData = createCardSchema.parse(body);

    // 5. Database operation
    await dbConnect();
    const card = await Card.create({
      userId: session.user.id,
      ...validatedData,
    });

    // 6. Return response
    return NextResponse.json(
      { data: card, message: 'Card created successfully' },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
```

---

## 5. Environment Variables

```env
# Database
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/vkard

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-generate-with-openssl

# File Upload (UploadThing)
UPLOADTHING_SECRET=sk_live_xxx
UPLOADTHING_APP_ID=xxx

# Optional: Analytics, Monitoring
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Copy to `.env.local` for local development. Never commit secrets.

---

## 6. Feature Map (by Role)

### Super Admin (`role: admin`)

- Create / manage user accounts
- Assign login credentials
- Manage subscriptions (plan, dates, payment status)
- System-wide stats

### User (`role: user`)

- Create / edit / preview digital cards
- Multi-step card builder
- Analytics dashboard (views, clicks, actions, shares)
- Account settings
- Public vanity URL: `/{username}`

### Public Card Page

- Profile + cover images
- Company name, job title, category, GST, about
- Quick actions: Call, WhatsApp, Email, Website, Maps
- Social links grid
- Business hours
- Analytics counters
- Save Contact (vCard) + Share
- Referral / branding footer (optional)

---

## 7. Key Routes Summary

| Path | Description |
|------|-------------|
| `/` | Landing page |
| `/login`, `/register` | Auth |
| `/dashboard` | User overview |
| `/cards`, `/cards/create`, `/cards/[cardId]/edit` | Card CRUD UI |
| `/analytics` | User analytics |
| `/settings` | Account settings |
| `/admin/dashboard` | Admin overview |
| `/admin/users`, `/admin/users/create` | User management |
| `/admin/subscriptions` | Subscription management |
| `/[username]` | Public digital card |
| `/api/auth/[...nextauth]` | NextAuth |
| `/api/cards`, `/api/users`, `/api/subscriptions` | REST APIs |
| `/api/analytics/[cardId]` | Card analytics API |
| `/api/upload` | File upload |
