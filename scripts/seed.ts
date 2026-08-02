import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env.local for seed script
try {
  const envPath = resolve(process.cwd(), ".env.local");
  const raw = readFileSync(envPath, "utf8");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
} catch {
  /* ignore */
}

type SeedAccount = {
  name: string;
  email: string;
  password: string;
  role: "admin" | "user";
};

async function upsertUser(
  User: mongoose.Model<mongoose.Document>,
  account: SeedAccount,
) {
  const email = account.email.toLowerCase();
  const passwordHash = await bcrypt.hash(account.password, 12);

  const user = await User.findOneAndUpdate(
    { email },
    {
      $set: {
        name: account.name,
        email,
        password: passwordHash,
        role: account.role,
        isActive: true,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  // Verify hash round-trip
  const ok = await bcrypt.compare(account.password, user.get("password"));
  if (!ok) {
    throw new Error(`Password hash verification failed for ${email}`);
  }

  console.log(`✓ ${account.role}: ${email} / ${account.password}`);
  return user;
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI missing — check .env.local");

  console.log("Connecting to", uri);
  await mongoose.connect(uri);

  const User =
    mongoose.models.User ||
    mongoose.model(
      "User",
      new mongoose.Schema(
        {
          name: String,
          email: { type: String, unique: true },
          password: String,
          role: String,
          isActive: { type: Boolean, default: true },
        },
        { timestamps: true },
      ),
    );

  const Subscription =
    mongoose.models.Subscription ||
    mongoose.model(
      "Subscription",
      new mongoose.Schema(
        {
          userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            unique: true,
          },
          plan: String,
          startDate: Date,
          endDate: Date,
          isActive: Boolean,
          autoRenew: Boolean,
          paymentStatus: String,
          amount: Number,
        },
        { timestamps: true },
      ),
    );

  const Card =
    mongoose.models.Card ||
    mongoose.model(
      "Card",
      new mongoose.Schema(
        {
          userId: mongoose.Schema.Types.ObjectId,
          username: { type: String, unique: true },
          profileImage: String,
          coverImage: String,
          backgroundMediaType: String,
          backgroundImages: [String],
          backgroundVideo: String,
          theme: Object,
          primaryCtas: Array,
          extraLinks: Object,
          galleryImages: [String],
          galleryVideos: [String],
          services: Array,
          paymentInfo: Object,
          actionButtons: Array,
          bankDetails: Object,
          companyName: String,
          jobTitle: String,
          businessType: String,
          businessCategory: String,
          aboutUs: String,
          gstNumber: String,
          email: String,
          phone: String,
          whatsappNumber: String,
          website: String,
          socialLinks: Object,
          location: Object,
          businessHours: Array,
          isVerified: Boolean,
          isActive: Boolean,
          template: String,
        },
        { timestamps: true },
      ),
    );

  // Primary accounts + legacy aliases from earlier NestJS docs
  const admin = await upsertUser(User, {
    name: "Super Admin",
    email: process.env.SEED_ADMIN_EMAIL || "admin@futurecard.local",
    password: process.env.SEED_ADMIN_PASSWORD || "Admin@123456",
    role: "admin",
  });

  await upsertUser(User, {
    name: "Super Admin (legacy)",
    email: "admin@digitalvcard.local",
    password: "Admin@123456",
    role: "admin",
  });

  const demo = await upsertUser(User, {
    name: "Demo User",
    email: process.env.SEED_USER_EMAIL || "demo@futurecard.local",
    password: process.env.SEED_USER_PASSWORD || "Demo@123456",
    role: "user",
  });

  const client = await upsertUser(User, {
    name: "Dhanya Client",
    email: "client@dhanya.local",
    password: "Client@123456",
    role: "user",
  });

  const startDate = new Date();
  const endDate = new Date();
  endDate.setFullYear(endDate.getFullYear() + 1);

  for (const user of [demo, client]) {
    await Subscription.findOneAndUpdate(
      { userId: user._id },
      {
        userId: user._id,
        plan: "basic",
        startDate,
        endDate,
        isActive: true,
        paymentStatus: "paid",
        amount: 999,
      },
      { upsert: true },
    );
  }

  const username = "dhanya_enterprises";
  await Card.findOneAndUpdate(
    { username },
    {
      userId: client._id,
      username,
      companyName: "Dhanya Enterprises",
      jobTitle: "Quality products. Trusted service.",
      businessType: "Wholesale & Retail",
      businessCategory: "Trading & Distribution",
      gstNumber: "29ABCDE1234F1Z5",
      aboutUs:
        "Dhanya Enterprises supplies premium wholesale goods across Karnataka with reliable delivery and fair pricing.\n\nWe partner with retailers and distributors to keep shelves stocked — from everyday essentials to seasonal specialty lines — backed by transparent rates and on-time logistics.",
      isVerified: true,
      email: "hello@dhanya.local",
      phone: "+919876543210",
      whatsappNumber: "+919876543210",
      website: "https://example.com",
      actionButtons: [
        { key: "call", enabled: true, value: "+919876543210" },
        { key: "whatsapp", enabled: true, value: "+919876543210" },
        { key: "email", enabled: true, value: "hello@dhanya.local" },
        { key: "website", enabled: true, value: "https://example.com" },
        { key: "bank", enabled: true, value: "" },
        {
          key: "address",
          enabled: true,
          value: "https://maps.google.com/?q=MG+Road+Bengaluru",
        },
        { key: "videos", enabled: true, value: "https://youtube.com" },
        {
          key: "brochures",
          enabled: true,
          value: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        },
        { key: "bookNow", enabled: true, value: "https://example.com/book" },
        { key: "form", enabled: true, value: "" },
        { key: "facebook", enabled: true, value: "https://facebook.com" },
        { key: "instagram", enabled: true, value: "https://instagram.com" },
        { key: "youtube", enabled: true, value: "https://youtube.com" },
        { key: "linkedin", enabled: true, value: "https://linkedin.com" },
        { key: "twitter", enabled: true, value: "https://x.com" },
        { key: "review", enabled: true, value: "https://g.page/r/review" },
        { key: "qr", enabled: true, value: "" },
        { key: "install", enabled: true, value: "" },
      ],
      profileImage:
        "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop",
      coverImage:
        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=400&fit=crop",
      backgroundMediaType: "slideshow",
      backgroundImages: [
        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=400&fit=crop",
        "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200&h=400&fit=crop",
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=400&fit=crop",
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=400&fit=crop",
      ],
      backgroundVideo: "",
      theme: {
        backgroundColor: "#FFF1F2",
        headerColor: "#BE123C",
        buttonColor: "#E11D48",
      },
      primaryCtas: [
        { id: "save", label: "Save Contact", url: "", enabled: true },
        { id: "services", label: "View Service", url: "", enabled: true },
        { id: "book", label: "Book Appointment", url: "", enabled: true },
        { id: "pay", label: "Pay Now (UPI)", url: "", enabled: true },
      ],
      bankDetails: {
        accountName: "Dhanya Enterprises",
        accountNumber: "123456789012",
        ifscCode: "SBIN0001234",
        bankName: "State Bank of India",
        branch: "MG Road, Bengaluru",
      },
      extraLinks: {
        bank: "https://example.com/bank",
        videos: "https://youtube.com",
        brochures: "https://example.com/brochure.pdf",
        bookNow: "https://example.com/book",
        form: "https://example.com/form",
        review: "https://g.page/r/review",
      },
      paymentInfo: {
        qrCodeImage:
          "https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=upi%3A%2F%2Fpay%3Fpa%3Ddhanya%40upi%26pn%3DDhanya%2520Enterprises",
        upiId: "dhanya@upi",
        upiMobile: "+919876543210",
      },
      galleryImages: [
        "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=800&fit=crop",
      ],
      galleryVideos: [
        "https://www.youtube.com/shorts/aqz-KE-bpKQ",
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      ],
      services: [
        {
          id: "svc-wholesale",
          title: "Wholesale Supply",
          price: "₹5,000+",
          description:
            "Bulk supply of quality goods with doorstep delivery across Karnataka. Ideal for retailers and distributors.",
          image:
            "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=500&fit=crop",
        },
        {
          id: "svc-retail",
          title: "Retail Packs",
          price: "₹499",
          description:
            "Curated retail packs for small shops. Flexible MOQ and seasonal offers available on request.",
          image:
            "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=500&fit=crop",
        },
        {
          id: "svc-consult",
          title: "Business Consultation",
          price: "Free",
          description:
            "30-minute consultation on sourcing, pricing, and inventory planning for your store.",
          image:
            "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&h=500&fit=crop",
        },
      ],
      socialLinks: {
        instagram: "https://instagram.com",
        facebook: "https://facebook.com",
        youtube: "https://youtube.com",
        linkedin: "https://linkedin.com",
      },
      location: {
        address: "MG Road, Bengaluru, Karnataka 560001",
        googleMapsUrl: "https://maps.google.com/?q=MG+Road+Bengaluru",
      },
      businessHours: [
        { day: "Monday", isOpen: true, openTime: "09:00", closeTime: "18:00" },
        { day: "Tuesday", isOpen: true, openTime: "09:00", closeTime: "18:00" },
        {
          day: "Wednesday",
          isOpen: true,
          openTime: "09:00",
          closeTime: "18:00",
        },
        { day: "Thursday", isOpen: true, openTime: "09:00", closeTime: "18:00" },
        { day: "Friday", isOpen: true, openTime: "09:00", closeTime: "18:00" },
        { day: "Saturday", isOpen: true, openTime: "10:00", closeTime: "14:00" },
        { day: "Sunday", isOpen: false, openTime: "00:00", closeTime: "00:00" },
      ],
      isActive: true,
      template: "classic",
    },
    { upsert: true },
  );

  console.log("✓ Demo card: /dhanya_enterprises");
  console.log("✓ Admin id:", admin._id.toString());
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
