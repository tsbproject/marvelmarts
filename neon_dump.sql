--
-- PostgreSQL database dump
--

\restrict ZdWgvXcaahd5Yt7Y3cCGsDSICWLyvapO7pUtQlafs1WoWs7bL0Adun261sMmGl0

-- Dumped from database version 18.2 (35fa9fe)
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: neon_auth; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA neon_auth;


--
-- Name: pgrst; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA pgrst;


--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


--
-- Name: BoostPlan; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."BoostPlan" AS ENUM (
    'FREE',
    'BASIC',
    'PRO',
    'ULTRA'
);


--
-- Name: ConversationType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ConversationType" AS ENUM (
    'CUSTOMER_VENDOR',
    'VENDOR_ADMIN',
    'CUSTOMER_ADMIN'
);


--
-- Name: DisputeStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."DisputeStatus" AS ENUM (
    'OPEN',
    'RESOLVED',
    'REJECTED'
);


--
-- Name: PaymentTypes; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PaymentTypes" AS ENUM (
    'CARD',
    'BANK_TRANSFER',
    'WALLET',
    'CASH_ON_DELIVERY'
);


--
-- Name: PayoutStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PayoutStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'COMPLETED',
    'FAILED'
);


--
-- Name: ProductStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ProductStatus" AS ENUM (
    'ACTIVE',
    'DRAFT',
    'ARCHIVED'
);


--
-- Name: ReviewStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ReviewStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);


--
-- Name: Role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."Role" AS ENUM (
    'SUPER_ADMIN',
    'ADMIN'
);


--
-- Name: TransactionStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TransactionStatus" AS ENUM (
    'PENDING',
    'SUCCESS',
    'FAILED'
);


--
-- Name: TransactionType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TransactionType" AS ENUM (
    'TOPUP',
    'PURCHASE',
    'REFUND'
);


--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."UserRole" AS ENUM (
    'SUPER_ADMIN',
    'ADMIN',
    'VENDOR',
    'CUSTOMER'
);


--
-- Name: VendorStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."VendorStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'NOT_STARTED',
    'AWAITING_DOCUMENTS',
    'PENDING_REVIEW'
);


--
-- Name: VendorTier; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."VendorTier" AS ENUM (
    'BRONZE',
    'SILVER',
    'GOLD'
);


--
-- Name: VerificationType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."VerificationType" AS ENUM (
    'CUSTOMER_REGISTRATION',
    'VENDOR_REGISTRATION'
);


--
-- Name: pre_config(); Type: FUNCTION; Schema: pgrst; Owner: -
--

CREATE FUNCTION pgrst.pre_config() RETURNS void
    LANGUAGE sql
    AS $$
  SELECT
      set_config('pgrst.db_schemas', 'public', true)
    , set_config('pgrst.db_aggregates_enabled', 'true', true)
    , set_config('pgrst.db_anon_role', 'anonymous', true)
    , set_config('pgrst.jwt_role_claim_key', '.role', true)
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: users_sync; Type: TABLE; Schema: neon_auth; Owner: -
--

CREATE TABLE neon_auth.users_sync (
    raw_json jsonb NOT NULL,
    id text GENERATED ALWAYS AS ((raw_json ->> 'id'::text)) STORED NOT NULL,
    name text GENERATED ALWAYS AS ((raw_json ->> 'display_name'::text)) STORED,
    email text GENERATED ALWAYS AS ((raw_json ->> 'primary_email'::text)) STORED,
    created_at timestamp with time zone GENERATED ALWAYS AS (to_timestamp((trunc((((raw_json ->> 'signed_up_at_millis'::text))::bigint)::double precision) / (1000)::double precision))) STORED,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone
);


--
-- Name: Account; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Account" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type text NOT NULL,
    provider text NOT NULL,
    "providerAccountId" text NOT NULL,
    refresh_token text,
    access_token text,
    expires_at integer,
    token_type text,
    scope text,
    id_token text,
    session_state text
);


--
-- Name: Address; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Address" (
    id text NOT NULL,
    "userId" text NOT NULL,
    label text,
    line1 text NOT NULL,
    line2 text,
    city text NOT NULL,
    state text,
    country text NOT NULL,
    zip text NOT NULL,
    phone text
);


--
-- Name: AdminProfile; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AdminProfile" (
    id text NOT NULL,
    "userId" text NOT NULL,
    permissions jsonb,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: BankAccount; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."BankAccount" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "bankName" text NOT NULL,
    "accountNumber" text NOT NULL,
    "accountName" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Blog; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Blog" (
    id text NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    content text NOT NULL,
    excerpt text,
    "coverImage" text,
    published boolean DEFAULT false NOT NULL,
    "authorId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Cart; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Cart" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: CartItem; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."CartItem" (
    id text NOT NULL,
    "cartId" text NOT NULL,
    "productId" text,
    "variantId" text,
    qty integer DEFAULT 1 NOT NULL,
    "unitPrice" numeric(10,2) NOT NULL
);


--
-- Name: Category; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Category" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    "parentId" text,
    "position" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "imageUrl" text,
    "metaDescription" text,
    "metaTitle" text,
    "isFeatured" boolean DEFAULT false NOT NULL
);


--
-- Name: Conversation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Conversation" (
    id text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "participantIds" text[],
    type public."ConversationType" DEFAULT 'CUSTOMER_VENDOR'::public."ConversationType" NOT NULL,
    subject text
);


--
-- Name: Coupon; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Coupon" (
    id text NOT NULL,
    code text NOT NULL,
    "discountValue" numeric(10,2) NOT NULL,
    "isPercentage" boolean DEFAULT true NOT NULL,
    "limit" integer DEFAULT 1 NOT NULL,
    "usedCount" integer DEFAULT 0 NOT NULL,
    "expiryDate" timestamp(3) without time zone NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: CreditTransaction; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."CreditTransaction" (
    id text NOT NULL,
    reference text NOT NULL,
    amount integer NOT NULL,
    platform text NOT NULL,
    status text NOT NULL,
    "vendorProfileId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "emailSent" boolean DEFAULT false NOT NULL,
    "emailSentAt" timestamp(3) without time zone
);


--
-- Name: CustomerProfile; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."CustomerProfile" (
    id text NOT NULL,
    "userId" text NOT NULL,
    phone text,
    address text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Dispute; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Dispute" (
    id text NOT NULL,
    "vendorProfileId" text NOT NULL,
    reason text NOT NULL,
    status public."DisputeStatus" DEFAULT 'OPEN'::public."DisputeStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "orderId" text NOT NULL,
    description text,
    "raisedById" text NOT NULL
);


--
-- Name: EmailVerification; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."EmailVerification" (
    id text NOT NULL,
    email text NOT NULL,
    code text NOT NULL,
    verified boolean DEFAULT false NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: FlashSale; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."FlashSale" (
    id text NOT NULL,
    name text NOT NULL,
    "startTime" timestamp(3) without time zone NOT NULL,
    "endTime" timestamp(3) without time zone NOT NULL,
    discount double precision NOT NULL,
    "isActive" boolean DEFAULT false NOT NULL
);


--
-- Name: HelpArticle; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."HelpArticle" (
    id text NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    excerpt text NOT NULL,
    content text NOT NULL,
    keywords text[],
    category text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    helpful integer DEFAULT 0 NOT NULL,
    "notHelpful" integer DEFAULT 0 NOT NULL
);


--
-- Name: Message; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Message" (
    id text NOT NULL,
    "conversationId" text NOT NULL,
    "senderId" text NOT NULL,
    "senderName" text,
    content text NOT NULL,
    "isRead" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "productId" text,
    "productImage" text,
    "productPrice" text
);


--
-- Name: NewsletterSubscriber; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."NewsletterSubscriber" (
    id text NOT NULL,
    email text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Notification; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Notification" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    link text,
    "isRead" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Order; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Order" (
    id text NOT NULL,
    "userId" text,
    status text DEFAULT 'pending'::text NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    shipping numeric(10,2) DEFAULT 0 NOT NULL,
    tax numeric(10,2) DEFAULT 0 NOT NULL,
    total numeric(10,2) NOT NULL,
    "paymentIntentId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    apartment text,
    city text,
    email text,
    "firstName" text,
    "lastName" text,
    "orderNotes" text,
    "orderNumber" text DEFAULT 'MARVEL-TEMP'::text NOT NULL,
    phone text,
    "shippingAddress" text,
    "shippingCity" text,
    "shippingState" text,
    state text,
    "streetAddress" text,
    "useDifferentShipping" boolean DEFAULT false NOT NULL,
    "paymentStatus" boolean DEFAULT false NOT NULL,
    "emailSent" boolean DEFAULT false NOT NULL,
    "refundStatus" text,
    "trackingNumber" text,
    "refundReason" text,
    "refundReference" text,
    "cancelReason" text,
    "vendorProfileId" text NOT NULL,
    "shippingFirstName" text,
    "shippingLastName" text,
    "paymentTypes" public."PaymentTypes"
);


--
-- Name: OrderItem; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."OrderItem" (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "productId" text,
    "variantId" text,
    qty integer NOT NULL,
    "unitPrice" numeric(10,2) NOT NULL,
    "imageUrl" text,
    title text
);


--
-- Name: PasswordResetToken; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PasswordResetToken" (
    id text NOT NULL,
    "userId" text NOT NULL,
    token text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: PaymentMethod; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PaymentMethod" (
    id text NOT NULL,
    "userId" text NOT NULL,
    provider text NOT NULL,
    "providerId" text NOT NULL,
    "cardType" text,
    last4 text NOT NULL,
    "expiryMonth" text NOT NULL,
    "expiryYear" text NOT NULL,
    "isDefault" boolean DEFAULT false NOT NULL,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Payout; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Payout" (
    id text NOT NULL,
    amount double precision NOT NULL,
    status public."PayoutStatus" DEFAULT 'PENDING'::public."PayoutStatus" NOT NULL,
    "vendorId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "accountName" text,
    "accountNumber" text,
    "bankName" text,
    "vendorProfileId" text NOT NULL,
    "adminRemarks" text,
    "processedAt" timestamp(3) without time zone,
    reference text NOT NULL
);


--
-- Name: Product; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Product" (
    id text NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    description text NOT NULL,
    brand text,
    price numeric(10,2) NOT NULL,
    "discountPrice" numeric(10,2),
    stock integer DEFAULT 0 NOT NULL,
    rating double precision DEFAULT 0 NOT NULL,
    "ratingCount" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "categoryId" text,
    "isFeatured" boolean DEFAULT false NOT NULL,
    "isPublished" boolean DEFAULT true NOT NULL,
    "lowStockThreshold" integer DEFAULT 5,
    "metaDescription" text,
    "metaTitle" text,
    status public."ProductStatus" DEFAULT 'ACTIVE'::public."ProductStatus" NOT NULL,
    sku text,
    tags text[],
    "isFlashSale" boolean DEFAULT false NOT NULL,
    "isNewArrival" boolean DEFAULT false NOT NULL,
    "shippingMethod" text,
    weight double precision,
    "isTrending" boolean DEFAULT false NOT NULL,
    "salesCount" integer DEFAULT 0 NOT NULL,
    "vendorProfileId" text NOT NULL,
    "boostUntil" timestamp(3) without time zone
);


--
-- Name: ProductImage; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ProductImage" (
    id text NOT NULL,
    "productId" text NOT NULL,
    url text NOT NULL,
    alt text,
    "order" integer DEFAULT 0 NOT NULL
);


--
-- Name: Review; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Review" (
    id text NOT NULL,
    "productId" text NOT NULL,
    "userId" text NOT NULL,
    rating integer NOT NULL,
    title text,
    body text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    approved boolean DEFAULT true NOT NULL,
    cons text,
    flagged boolean DEFAULT false NOT NULL,
    pros text,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "isVerified" boolean DEFAULT false NOT NULL
);


--
-- Name: Session; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Session" (
    id text NOT NULL,
    "sessionToken" text NOT NULL,
    "userId" text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


--
-- Name: Ticket; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Ticket" (
    id text NOT NULL,
    subject text NOT NULL,
    message text NOT NULL,
    status text DEFAULT 'OPEN'::text NOT NULL,
    "userEmail" text NOT NULL,
    "articleId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    notes text
);


--
-- Name: User; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    "passwordHash" text,
    image text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    name text,
    permissions jsonb,
    "IsVerified" boolean DEFAULT false NOT NULL,
    "isSuspended" boolean DEFAULT false NOT NULL,
    balance double precision DEFAULT 0.0 NOT NULL,
    roles public."UserRole"[] DEFAULT ARRAY['CUSTOMER'::public."UserRole"],
    role public."UserRole",
    "walletBalance" double precision DEFAULT 0 NOT NULL,
    phone text,
    "paymentTypes" public."PaymentTypes"[]
);


--
-- Name: Variant; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Variant" (
    id text NOT NULL,
    "productId" text NOT NULL,
    name text NOT NULL,
    price numeric(10,2),
    stock integer DEFAULT 0 NOT NULL,
    attributes jsonb,
    sku text
);


--
-- Name: VendorBoost; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."VendorBoost" (
    id text NOT NULL,
    "vendorProfileId" text NOT NULL,
    credits integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    plan public."BoostPlan" DEFAULT 'FREE'::public."BoostPlan" NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "exhaustedAlertSent" boolean DEFAULT false NOT NULL,
    "lowCreditAlertSent" boolean DEFAULT false NOT NULL
);


--
-- Name: VendorOnboarding; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."VendorOnboarding" (
    id text NOT NULL,
    "vendorProfileId" text NOT NULL,
    "profileDone" boolean DEFAULT false NOT NULL,
    "storeDone" boolean DEFAULT false NOT NULL,
    "productDone" boolean DEFAULT false NOT NULL,
    completed boolean DEFAULT false NOT NULL
);


--
-- Name: VendorProfile; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."VendorProfile" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    "storeName" text NOT NULL,
    "storePhone" text NOT NULL,
    "storeAddress" text NOT NULL,
    country text NOT NULL,
    state text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "isVerified" boolean DEFAULT false NOT NULL,
    bio text,
    "coverUrl" text,
    "logoUrl" text,
    "isSuspended" boolean DEFAULT false NOT NULL,
    "rejectionReason" text,
    status public."VendorStatus" DEFAULT 'PENDING'::public."VendorStatus" NOT NULL,
    "verificationDoc" text,
    "accountName" text,
    "accountNumber" text,
    "bankName" text,
    facebook text,
    instagram text,
    twitter text,
    whatsapp text,
    balance numeric(10,2) DEFAULT 0.00 NOT NULL,
    "lastSyncedAt" timestamp(3) without time zone,
    "productDone" boolean DEFAULT false NOT NULL,
    "profileDone" boolean DEFAULT false NOT NULL,
    "storeDone" boolean DEFAULT false NOT NULL,
    "businessDoc" text,
    "identityDoc" text,
    "locationDoc" text,
    "payoutsDone" boolean DEFAULT false NOT NULL
);


--
-- Name: VendorScore; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."VendorScore" (
    id text NOT NULL,
    "vendorProfileId" text NOT NULL,
    score integer DEFAULT 0 NOT NULL,
    tier public."VendorTier" DEFAULT 'BRONZE'::public."VendorTier" NOT NULL
);


--
-- Name: VendorStore; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."VendorStore" (
    id text NOT NULL,
    "vendorProfileId" text NOT NULL,
    slug text NOT NULL,
    name text NOT NULL,
    logo text,
    banner text,
    description text,
    followers integer DEFAULT 0 NOT NULL
);


--
-- Name: VendorVerification; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."VendorVerification" (
    id text NOT NULL,
    email text NOT NULL,
    code text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    used boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: VerificationCode; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."VerificationCode" (
    id text NOT NULL,
    "userId" text,
    email text NOT NULL,
    "hashedPassword" text,
    name text,
    code text NOT NULL,
    type public."VerificationType" NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    used boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "vendorData" jsonb
);


--
-- Name: Wallet; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Wallet" (
    id text NOT NULL,
    "userId" text NOT NULL,
    balance numeric(10,2) DEFAULT 0.0 NOT NULL,
    currency text DEFAULT 'NGN'::text NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: WalletTransaction; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."WalletTransaction" (
    id text NOT NULL,
    "walletId" text NOT NULL,
    amount numeric(10,2) NOT NULL,
    type text NOT NULL,
    status text DEFAULT 'SUCCESS'::text NOT NULL,
    reference text NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Wishlist; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Wishlist" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "productId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Withdrawal; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Withdrawal" (
    id text NOT NULL,
    "vendorProfileId" text NOT NULL,
    amount double precision NOT NULL,
    status text DEFAULT 'PENDING'::text NOT NULL,
    reference text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: _ProductCategories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."_ProductCategories" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


--
-- Name: _ProductToFlashSale; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."_ProductToFlashSale" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


--
-- Name: _UserConversations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."_UserConversations" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- Name: site_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.site_settings (
    id integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "accentNavy" text,
    "brandPrimary" text,
    "brandOrangeLight" text,
    "neutralWhite" text,
    "neutralLight" text,
    "neutralGray" text,
    "neutralDark" text,
    "layoutScale" double precision,
    "baseFontSize" integer,
    "bodyFontScale" double precision,
    "headingFontScale" double precision,
    "headerFontScale" double precision,
    "footerFontScale" double precision,
    "carouselFontScale" double precision,
    "headerBg" text,
    "headerText" text,
    "headerBorder" text,
    "showSearchBar" boolean DEFAULT true NOT NULL,
    "footerBg" text,
    "footerText" text,
    "showSocialIcons" boolean DEFAULT true NOT NULL,
    "productCardRadius" text,
    "productCardShadow" text,
    "productPriceColor" text,
    "addToCartBg" text,
    "addToCartText" text,
    "showFeaturedProducts" boolean DEFAULT true NOT NULL,
    "showFlashSales" boolean DEFAULT true NOT NULL,
    "showFeaturedCategories" boolean DEFAULT true NOT NULL,
    "showNewArrivals" boolean DEFAULT true NOT NULL,
    "showTestimonials" boolean DEFAULT true NOT NULL,
    "cartDrawerPosition" text DEFAULT 'right'::text,
    "cartDrawerWidth" text DEFAULT '400px'::text,
    "helpMenuPosition" text DEFAULT 'bottom-right'::text,
    "showEcommerceCarousel" boolean DEFAULT true NOT NULL,
    "showTrendingProducts" boolean DEFAULT true NOT NULL,
    "facebookUrl" text,
    "footerBodyFontSize" integer DEFAULT 16,
    "footerHeadingFontSize" integer DEFAULT 20,
    "footerLogo" text,
    "instagramUrl" text,
    "twitterUrl" text,
    "whatsappUrl" text
);


--
-- Data for Name: users_sync; Type: TABLE DATA; Schema: neon_auth; Owner: -
--

COPY neon_auth.users_sync (raw_json, updated_at, deleted_at) FROM stdin;
{"id": "6d768789-093d-4652-92a4-b7fd7d1d59a8", "display_name": "Tayo Samuel", "has_password": false, "is_anonymous": false, "primary_email": "tsbolarinwa@gmail.com", "selected_team": null, "auth_with_email": false, "client_metadata": null, "oauth_providers": [], "server_metadata": null, "otp_auth_enabled": false, "selected_team_id": null, "profile_image_url": null, "requires_totp_mfa": false, "signed_up_at_millis": 1765598289247, "passkey_auth_enabled": false, "last_active_at_millis": 1765598289247, "primary_email_verified": false, "client_read_only_metadata": null, "primary_email_auth_enabled": true}	2025-12-13 03:58:09+00	\N
\.


--
-- Data for Name: Account; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Account" (id, "userId", type, provider, "providerAccountId", refresh_token, access_token, expires_at, token_type, scope, id_token, session_state) FROM stdin;
\.


--
-- Data for Name: Address; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Address" (id, "userId", label, line1, line2, city, state, country, zip, phone) FROM stdin;
\.


--
-- Data for Name: AdminProfile; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."AdminProfile" (id, "userId", permissions, notes, "createdAt", "updatedAt") FROM stdin;
34caa4ac-a6be-4823-b298-616417c481d4	3072d767-e104-4a15-8b65-295e8f38fede	{"manageBlogs": true, "manageUsers": true, "manageAdmins": true, "manageOrders": true, "manageReviews": true, "manageSupport": true, "manageVendors": true, "manageActivity": true, "manageProducts": true, "manageSettings": true, "manageTrending": true, "manageCategories": true, "manageSubscribers": true, "manageVerifications": true}	\N	2026-03-26 18:30:14.172	2026-03-26 18:30:14.172
\.


--
-- Data for Name: BankAccount; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."BankAccount" (id, "userId", "bankName", "accountNumber", "accountName", "createdAt", "updatedAt") FROM stdin;
cmn8x4j8e000004jyp92yc41j	cmn8aydn2000104l7f3b1ul9s	Opay	8186019049	TAYO BOLARINWA 	2026-03-27 13:09:32.126	2026-03-27 13:09:32.126
\.


--
-- Data for Name: Blog; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Blog" (id, title, slug, content, excerpt, "coverImage", published, "authorId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Cart; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Cart" (id, "userId", "createdAt", "updatedAt") FROM stdin;
cmn9d5jc3000olkvj306acdyf	cmn7vk7v800018svja1fktsv9	2026-03-27 20:38:12.465	2026-03-27 20:38:12.465
\.


--
-- Data for Name: CartItem; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."CartItem" (id, "cartId", "productId", "variantId", qty, "unitPrice") FROM stdin;
cmn9d5kon000plkvjltr46o66	cmn9d5jc3000olkvj306acdyf	cmn82qm7g000j8svj28kgqlzu	\N	1	360800.00
cmn9d5pkt000qlkvjidkgdjv0	cmn9d5jc3000olkvj306acdyf	cmn83exd9000n8svja875go80	\N	1	152000.00
cmn9d5rdg000rlkvjs3wq4hjc	cmn9d5jc3000olkvj306acdyf	cmn84hpbo000p8svjpg8bpkmj	\N	1	50000.00
\.


--
-- Data for Name: Category; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Category" (id, name, slug, "parentId", "position", "createdAt", "updatedAt", "imageUrl", "metaDescription", "metaTitle", "isFeatured") FROM stdin;
cmjg9igzd00067wvjju8kkcep	SkIN CARE	skin-care	cmjdlsw9t0007vwvjjgm43ay7	2	2025-12-21 21:51:51.673	2026-01-12 23:08:27.879	\N	\N	\N	f
cmjg9iyzd00077wvjamofgngr	MAKE UP	make-up	cmjdlsw9t0007vwvjjgm43ay7	1	2025-12-21 21:52:15.001	2026-01-12 23:09:21.032	\N	\N	\N	f
cmjdls81p0006vwvjd41gjm81	Automobile	automobile-2	\N	7	2025-12-20 01:12:03.517	2026-01-12 22:10:50.002	\N	This a special category for automobiles and its accessories	automobile	f
cmjg9jnjm00087wvjsy7eb2nm	HEALTH CARE	health-care	cmjdlsw9t0007vwvjjgm43ay7	3	2025-12-21 21:52:46.834	2026-01-12 23:48:00.118	\N	\N	\N	f
cmjdltoi30008vwvj621x2w9c	African Arts & Crafts	african-arts-crafts-2	\N	9	2025-12-20 01:13:11.499	2026-01-13 16:43:47.779	\N	This category is specially for Arts and Crafts of various types and origin	african arts	f
cmjdlsw9t0007vwvjjgm43ay7	Health and Beauty	health-and-beauty-2	\N	8	2025-12-20 01:12:34.913	2026-01-12 23:00:27.551	\N	This is a dedicated category for health and beauty on marvelmarts	health and beauty	f
cmjg9md6l00097wvjvgobtx2c	Paintings	paintings-2	cmjdltoi30008vwvj621x2w9c	1	2025-12-21 21:54:53.373	2026-01-13 16:45:54.73	\N	\N	\N	f
cmk4us2t3000hqwvjhvu4bvka	DESKTOP AND MONITORS	desktop-and-monitors	cmk4o07ls0000qwvj5ft7s0bi	3	2026-01-08 02:53:40.023	2026-01-08 02:53:40.023	\N	\N	\N	f
cmk4o26q50002qwvjnfpmuyhn	Mini Laptops and Netbooks	mini-laptops-and-netbooks	cmk4o1bnr0001qwvjvfhh6zvm	1	2026-01-07 23:45:34.348	2026-01-07 23:45:34.348	\N	\N	\N	f
cmk4o2rek0003qwvjqpx4gl8e	Ultrabooks	ultrabooks	cmk4o1bnr0001qwvjvfhh6zvm	2	2026-01-07 23:46:01.147	2026-01-07 23:46:01.147	\N	\N	\N	f
cmk4o3cj10004qwvjcemggkbg	Notebooks	notebooks	cmk4o1bnr0001qwvjvfhh6zvm	3	2026-01-07 23:46:28.525	2026-01-07 23:46:28.525	\N	\N	\N	f
cmk4o4tlk0005qwvjxz3ugids	Hybrid PCs	hybrid-pcs	cmk4o1bnr0001qwvjvfhh6zvm	4	2026-01-07 23:47:37.303	2026-01-07 23:47:37.303	\N	\N	\N	f
cmk4o5jnq0006qwvjb9a9i437	Macbooks	macbooks	cmk4o1bnr0001qwvjvfhh6zvm	5	2026-01-07 23:48:11.078	2026-01-07 23:48:11.078	\N	\N	\N	f
cmjg9p3es000b7wvjnybwojae	Handmade	handmade-2	cmjdltoi30008vwvj621x2w9c	2	2025-12-21 21:57:00.676	2026-01-13 16:47:06.902	\N	\N	\N	f
cmjg9nmzh000a7wvju0ti0x9m	Sculptures	sculptures-2	cmjdltoi30008vwvj621x2w9c	3	2025-12-21 21:55:52.733	2026-01-13 16:47:20.659	\N	\N	\N	f
cmjdlu8w20009vwvjut0m9zdg	Other Categories	other-categories-2	\N	10	2025-12-20 01:13:37.922	2026-01-13 16:57:40.102	\N	Other categories for products not captured in the main categories	 other categories	f
cmk4usv4y000iqwvj5pvbvo7y	Desktop Bundles	desktop-bundles	cmk4us2t3000hqwvjhvu4bvka	1	2026-01-08 02:54:16.738	2026-01-08 02:54:16.738	\N	\N	\N	f
cmjg9q5kd000c7wvj739hhvlz	MISCELLANOUS	miscellanous	cmjdlu8w20009vwvjut0m9zdg	8	2025-12-21 21:57:50.125	2026-01-13 16:59:48.142	\N	\N	\N	f
cmk4utkmt000jqwvj489572vq	CPUs	cpus	cmk4us2t3000hqwvjhvu4bvka	2	2026-01-08 02:54:49.781	2026-01-08 02:54:49.781	\N	\N	\N	f
cmk4omodr0007qwvjnu6ym3ok	WIFI AND NETWORKING	wifi-and-networking	cmk4o07ls0000qwvj5ft7s0bi	2	2026-01-08 00:01:30.351	2026-01-08 00:01:30.351	\N	\N	\N	f
cmk4u6udu0008qwvji896apvn	Routers	routers	cmk4omodr0007qwvjnu6ym3ok	1	2026-01-08 02:37:09.33	2026-01-08 02:37:09.33	\N	\N	\N	f
cmk4u79zv0009qwvjd1f68lqu	Modems	modems	cmk4omodr0007qwvjnu6ym3ok	2	2026-01-08 02:37:29.563	2026-01-08 02:37:29.563	\N	\N	\N	f
cmk4u7v85000aqwvj0j1lcgwh	Switches	switches	cmk4omodr0007qwvjnu6ym3ok	3	2026-01-08 02:37:57.077	2026-01-08 02:37:57.077	\N	\N	\N	f
cmk4u8ja8000bqwvjm9z6v5eo	Networking Gadgets	networking-gadgets	cmk4omodr0007qwvjnu6ym3ok	4	2026-01-08 02:38:28.256	2026-01-08 02:38:28.256	\N	\N	\N	f
cmk4utzn4000kqwvjthgzkgec	Servers	servers	cmk4us2t3000hqwvjhvu4bvka	3	2026-01-08 02:55:09.232	2026-01-08 02:55:09.232	\N	\N	\N	f
cmk4uupn3000lqwvj30989899	Monitors	monitors	cmk4us2t3000hqwvjhvu4bvka	4	2026-01-08 02:55:42.927	2026-01-08 02:55:42.927	\N	\N	\N	f
cmk4uvo7c000mqwvjdpv6cd7x	GAMING	gaming	cmk4o07ls0000qwvj5ft7s0bi	4	2026-01-08 02:56:27.72	2026-01-08 02:56:27.72	\N	\N	\N	f
cmk4uxvgx000nqwvjad7rucne	 PC Games	pc-games	cmk4uvo7c000mqwvjdpv6cd7x	1	2026-01-08 02:58:10.449	2026-01-08 02:58:10.449	\N	\N	\N	f
cmk4uzeyt000oqwvjpgu09d5a	PC Gaming Accessories	pc-gaming-accessories	cmk4uvo7c000mqwvjdpv6cd7x	4	2026-01-08 02:59:22.373	2026-01-08 02:59:22.373	\N	\N	\N	f
cmk4vrva1000pqwvj21hq7r9z	COMPUTER ACCESSORIES	computer-accessories	cmk4o07ls0000qwvj5ft7s0bi	5	2026-01-08 03:21:29.881	2026-01-08 03:21:29.881	\N	\N	\N	f
cmk4vu1y8000qqwvjdpll50fn	Storage Devices	storage-devices	cmk4vrva1000pqwvj21hq7r9z	1	2026-01-08 03:23:11.84	2026-01-08 03:23:11.84	\N	\N	\N	f
cmk4vuwd0000rqwvjdel4tnvb	Laptop & Desktop Accessories	laptop-desktop-accessories	cmk4vrva1000pqwvj21hq7r9z	2	2026-01-08 03:23:51.251	2026-01-08 03:23:51.251	\N	\N	\N	f
cmk4vvgp7000sqwvjf2all04j	Bags,Cases,Covers & Sleeves	bagscasescovers-sleeves	cmk4vrva1000pqwvj21hq7r9z	3	2026-01-08 03:24:17.611	2026-01-08 03:24:17.611	\N	\N	\N	f
cmk4vvzs9000tqwvjcnj3b7vv	Bags,Cases,Covers & Sleeves	bagscasescovers-sleeves-2	cmk4vrva1000pqwvj21hq7r9z	3	2026-01-08 03:24:42.345	2026-01-08 03:24:42.345	\N	\N	\N	f
cmk4vwq6r000uqwvjr1hhohff	Computer Peripherals	computer-peripherals	cmk4vrva1000pqwvj21hq7r9z	4	2026-01-08 03:25:16.563	2026-01-08 03:25:16.563	\N	\N	\N	f
cmk4vxgh7000vqwvj49qbgww8	 Scanners	scanners	cmk4vrva1000pqwvj21hq7r9z	5	2026-01-08 03:25:50.635	2026-01-08 03:25:50.635	\N	\N	\N	f
cmk4vz4qu000wqwvj7lsy85p2	 Uninterrupted Power Supply	uninterrupted-power-supply	cmk4vrva1000pqwvj21hq7r9z	6	2026-01-08 03:27:08.742	2026-01-08 03:27:08.742	\N	\N	\N	f
cmk4vzyfz000xqwvj8fbc58g4	Video Projectors	video-projectors	cmk4vrva1000pqwvj21hq7r9z	8	2026-01-08 03:27:47.231	2026-01-08 03:27:47.231	\N	\N	\N	f
cmk4w19is000yqwvj0p3pf4hp	Keyboards & Mice	keyboards-mice	cmk4vrva1000pqwvj21hq7r9z	9	2026-01-08 03:28:48.244	2026-01-08 03:28:48.244	\N	\N	\N	f
cmk4w3okj000zqwvjhps4tmz2	PRINTERS,SCANNER & ACCESSORIES	printersscanner-accessories	cmk4o07ls0000qwvj5ft7s0bi	6	2026-01-08 03:30:41.059	2026-01-08 03:30:41.059	\N	\N	\N	f
cmk4w52rt0010qwvj6om85d0d	Scanners	scanners-2	cmk4w3okj000zqwvjhps4tmz2	1	2026-01-08 03:31:46.121	2026-01-08 03:31:46.121	\N	\N	\N	f
cmk4wc27s0016qwvjoxobcmft	Operating Systems	operating-systems	cmk4w8c780014qwvjpvmk68ie	2	2026-01-08 03:37:11.992	2026-01-08 03:37:11.992	\N	\N	\N	f
cmk4wcu1r0017qwvj44s7f4ht	Security & Utilities	security-utilities	cmk4w8c780014qwvjpvmk68ie	3	2026-01-08 03:37:48.063	2026-01-08 03:37:48.063	\N	\N	\N	f
cmk4w6huw0011qwvjjyu2j1yd	Inks, Toners & Cartridges	inks-toners-cartridges	cmk4w3okj000zqwvjhps4tmz2	2	2026-01-08 03:32:52.328	2026-01-08 03:32:52.328	\N	\N	\N	f
cmk4w724y0012qwvjmb0jdwqk	Printers	printers	cmk4w3okj000zqwvjhps4tmz2	3	2026-01-08 03:33:18.61	2026-01-08 03:33:18.61	\N	\N	\N	f
cmk4w8c780014qwvjpvmk68ie	COMPUTER SOFTWARES	computer-softwares	cmk4o07ls0000qwvj5ft7s0bi	7	2026-01-08 03:34:18.308	2026-01-08 03:34:18.308	\N	\N	\N	f
cmk4wb8qo0015qwvjywhj4lkd	Office & Business	office-business	cmk4w8c780014qwvjpvmk68ie	1	2026-01-08 03:36:33.792	2026-01-08 03:36:33.792	\N	\N	\N	f
cmk61fwx800002cvjmx2tgbhr	Phones and Tablets	phones-and-tablets	\N	2	2026-01-08 22:47:56.011	2026-01-08 22:47:56.011	\N	\N	\N	f
cmk61keuh00022cvjod1z380p	Smartphones	smartphones	cmk61hznh00012cvjty0ea64f	2	2026-01-08 22:51:25.864	2026-01-08 22:51:25.864	\N	\N	\N	f
cmk628w1700032cvj9awpbifq	Basic Phones	basic-phones	cmk61hznh00012cvjty0ea64f	2	2026-01-08 23:10:27.883	2026-01-08 23:10:27.883	\N	\N	\N	f
cmk61hznh00012cvjty0ea64f	MOBILE PHONES	mobile-phones	cmk61fwx800002cvjmx2tgbhr	1	2026-01-08 22:49:32.861	2026-03-27 17:03:47.709	https://res.cloudinary.com/dq0vynxci/image/upload/v1774631024/b4xbib6a8k5toemwc8fj.jpg	\N	\N	t
cmk62abpn00042cvj3vff3vj1	TABLETS	tablets	cmk61fwx800002cvjmx2tgbhr	2	2026-01-08 23:11:34.859	2026-01-08 23:11:34.859	\N	\N	\N	f
cmk62bmss00052cvjunl1ex5z	Android Tablets	android-tablets	cmk62abpn00042cvj3vff3vj1	1	2026-01-08 23:12:35.884	2026-01-08 23:12:35.884	\N	\N	\N	f
cmk62d49e00062cvjhq9qbvc8	iPads	ipads	cmk62abpn00042cvj3vff3vj1	2	2026-01-08 23:13:45.17	2026-01-08 23:13:45.17	\N	\N	\N	f
cmk62el0g00072cvj7z8549ri	 Educational Tablets	educational-tablets	cmk62abpn00042cvj3vff3vj1	3	2026-01-08 23:14:53.535	2026-01-08 23:14:53.535	\N	\N	\N	f
cmk62h62c00082cvjghyl8s0q	TABLET ACCESSORIES	tablet-accessories	cmk61fwx800002cvjmx2tgbhr	3	2026-01-08 23:16:54.131	2026-01-08 23:16:54.131	\N	\N	\N	f
cmk62itzw00092cvjwzouviag	 Cases and Covers	cases-and-covers	cmk62h62c00082cvjghyl8s0q	1	2026-01-08 23:18:11.804	2026-01-08 23:18:11.804	\N	\N	\N	f
cmk62k91f000a2cvjy4es6u31	Holders & Stands	holders-stands	cmk62h62c00082cvjghyl8s0q	2	2026-01-08 23:19:17.955	2026-01-08 23:19:17.955	\N	\N	\N	f
cmk62lmhr000b2cvj7nx8946f	Other Accessories	other-accessories	cmk62h62c00082cvjghyl8s0q	3	2026-01-08 23:20:22.047	2026-01-08 23:20:22.047	\N	\N	\N	f
cmk62ntmk000c2cvjgffz4zgw	 MOBILE PHONE ACCESSORIES	mobile-phone-accessories	cmk61fwx800002cvjmx2tgbhr	4	2026-01-08 23:22:04.604	2026-01-08 23:22:04.604	\N	\N	\N	f
cmk62owy2000d2cvjfph9rs52	Smart Watches	smart-watches	cmk62ntmk000c2cvjgffz4zgw	1	2026-01-08 23:22:55.562	2026-01-08 23:22:55.562	\N	\N	\N	f
cmk62qxhc000e2cvj7xiql326	Selfie Sticks & Tripods	selfie-sticks-tripods	cmk62ntmk000c2cvjgffz4zgw	2	2026-01-08 23:24:29.568	2026-01-08 23:24:29.568	\N	\N	\N	f
cmk62s0ov000f2cvjk38or7v9	Screen Protectors	screen-protectors	cmk62ntmk000c2cvjgffz4zgw	3	2026-01-08 23:25:20.383	2026-01-08 23:25:20.383	\N	\N	\N	f
cmk62sqma000g2cvjmuouih9z	MicroSD Cards	microsd-cards	cmk62ntmk000c2cvjgffz4zgw	4	2026-01-08 23:25:53.985	2026-01-08 23:25:53.985	\N	\N	\N	f
cmk62u3v6000h2cvjpdm7azai	Earphones & Headsets	earphones-headsets	cmk62ntmk000c2cvjgffz4zgw	5	2026-01-08 23:26:57.81	2026-01-08 23:26:57.81	\N	\N	\N	f
cmk62vnb0000i2cvjqvzxqlse	Chargers	chargers	cmk62ntmk000c2cvjgffz4zgw	6	2026-01-08 23:28:09.66	2026-01-08 23:28:09.66	\N	\N	\N	f
cmk62wcao000j2cvjgsqudhtq	Car Accessorie	car-accessorie	cmk62ntmk000c2cvjgffz4zgw	7	2026-01-08 23:28:42.047	2026-01-08 23:28:42.047	\N	\N	\N	f
cmk62x5l6000k2cvj8zeeauje	Cables	cables	cmk62ntmk000c2cvjgffz4zgw	7	2026-01-08 23:29:20.009	2026-01-08 23:29:20.009	\N	\N	\N	f
cmk62y3zi000l2cvjjn3m5jt9	Bluetooth Headsets	bluetooth-headsets	cmk62ntmk000c2cvjgffz4zgw	9	2026-01-08 23:30:04.59	2026-01-08 23:30:04.59	\N	\N	\N	f
cmk62zxqi000m2cvjttjso6mg	Battery Chargers	battery-chargers	cmk62ntmk000c2cvjgffz4zgw	10	2026-01-08 23:31:29.802	2026-01-08 23:31:29.802	\N	\N	\N	f
cmk631mls000n2cvjwx8q0iag	Batteries	batteries	cmk62ntmk000c2cvjgffz4zgw	11	2026-01-08 23:32:48.687	2026-01-08 23:32:48.687	\N	\N	\N	f
cmk632g54000o2cvjmtz1yggh	 Adapters	adapters	cmk62ntmk000c2cvjgffz4zgw	12	2026-01-08 23:33:26.968	2026-01-08 23:33:26.968	\N	\N	\N	f
cmk6343se000p2cvjvr0hec8k	Accessory Kits	accessory-kits	cmk62ntmk000c2cvjgffz4zgw	13	2026-01-08 23:34:44.27	2026-01-08 23:34:44.27	\N	\N	\N	f
cmk77bypc0001scvjpqgzqe0i	TELEVISIONS	televisions	cmk77ai990000scvj00m4ee13	1	2026-01-09 18:20:35.568	2026-01-09 18:20:35.568	\N	\N	\N	f
cmk77cmem0002scvj39dlj29g	Smart TVs	smart-tvs	cmk77bypc0001scvjpqgzqe0i	1	2026-01-09 18:21:06.286	2026-01-09 18:21:06.286	\N	\N	\N	f
cmk77demm0003scvjrxpxuv81	LED TVs	led-tvs	cmk77bypc0001scvjpqgzqe0i	2	2026-01-09 18:21:42.862	2026-01-09 18:21:42.862	\N	\N	\N	f
cmk77hnak0004scvjuo0ogiil	Plasma TVs	plasma-tvs	cmk77bypc0001scvjpqgzqe0i	3	2026-01-09 18:25:00.716	2026-01-09 18:25:00.716	\N	\N	\N	f
cmk77iaxy0005scvjoenpes7o	OLED TVs	oled-tvs	cmk77bypc0001scvjpqgzqe0i	4	2026-01-09 18:25:31.366	2026-01-09 18:25:31.366	\N	\N	\N	f
cmk77jaaj0006scvjb7cr8q7v	Curved TVs	curved-tvs	cmk77bypc0001scvjpqgzqe0i	5	2026-01-09 18:26:17.178	2026-01-09 18:26:17.178	\N	\N	\N	f
cmk77k8r50007scvjdiedwcdf	DVD PLAYERS & RECORDERS	dvd-players-recorders	cmk77ai990000scvj00m4ee13	2	2026-01-09 18:27:01.841	2026-01-09 18:27:01.841	\N	\N	\N	f
cmk77nbqp0008scvjot7s0efd	DVD Recorders	dvd-recorders	cmk77k8r50007scvjdiedwcdf	1	2026-01-09 18:29:25.68	2026-01-09 18:29:25.68	\N	\N	\N	f
cmk7hirkp0009scvjaqdfmw6w	DVD Players	dvd-players	cmk77k8r50007scvjdiedwcdf	2	2026-01-09 23:05:49.081	2026-01-09 23:05:49.081	\N	\N	\N	f
cmk7hl97h000ascvj52q7pbaf	CAMERAS	cameras	cmk77ai990000scvj00m4ee13	3	2026-01-09 23:07:45.245	2026-01-09 23:07:45.245	\N	\N	\N	f
cmk7hmma6000bscvjxirgcxyl	Digital Cameras	digital-cameras	cmk7hl97h000ascvj52q7pbaf	1	2026-01-09 23:08:48.846	2026-01-09 23:08:48.846	\N	\N	\N	f
cmk7ho0hs000cscvjfrz6dcxl	 Professional & SLR Cameras	professional-slr-cameras	cmk7hl97h000ascvj52q7pbaf	2	2026-01-09 23:09:53.917	2026-01-09 23:09:53.917	\N	\N	\N	f
cmk7hpyt2000dscvj0mb86jxg	Camera Lenses & Accessories	camera-lenses-accessories	cmk7hl97h000ascvj52q7pbaf	3	2026-01-09 23:11:25.046	2026-01-09 23:11:25.046	\N	\N	\N	f
cmk7hrawd000escvjwbqdw4su	Camcorders & Video Cameras	camcorders-video-cameras	cmk7hl97h000ascvj52q7pbaf	4	2026-01-09 23:12:27.372	2026-01-09 23:12:27.372	\N	\N	\N	f
cmk7hshp7000fscvj46tyvtnr	CCTV Cameras	cctv-cameras	cmk7hl97h000ascvj52q7pbaf	5	2026-01-09 23:13:22.843	2026-01-09 23:13:22.843	\N	\N	\N	f
cmk7htveb000gscvjsu51y0nr	ACCESSORIES	accessories	cmk77ai990000scvj00m4ee13	4	2026-01-09 23:14:27.251	2026-01-09 23:14:27.251	\N	\N	\N	f
cmk7hv8z0000hscvj3fpd7guf	Headphones	headphones	cmk7htveb000gscvjsu51y0nr	1	2026-01-09 23:15:31.5	2026-01-09 23:15:31.5	\N	\N	\N	f
cmk7hwgr6000iscvj9g3r9toc	Television Accessories	television-accessories	cmk7htveb000gscvjsu51y0nr	2	2026-01-09 23:16:28.242	2026-01-09 23:16:28.242	\N	\N	\N	f
cmk7hys9i000jscvjl26joqsz	 Gaming Accessories	gaming-accessories	cmk7htveb000gscvjsu51y0nr	3	2026-01-09 23:18:16.47	2026-01-09 23:18:16.47	\N	\N	\N	f
cmk7i0rvx000kscvjrwrz0hsw	Other Accessories	other-accessories-2	cmk7htveb000gscvjsu51y0nr	4	2026-01-09 23:19:49.293	2026-01-09 23:19:49.293	\N	\N	\N	f
cmk7i3ion000lscvj5sk9o5nc	HOME THEATERS & AUDIO SYSTEM	home-theaters-audio-system	cmk77ai990000scvj00m4ee13	5	2026-01-09 23:21:57.335	2026-01-09 23:21:57.335	\N	\N	\N	f
cmk7i4w1r000mscvjvxwrfrey	Home Theatre	home-theatre	cmk7i3ion000lscvj5sk9o5nc	1	2026-01-09 23:23:01.311	2026-01-09 23:23:01.311	\N	\N	\N	f
cmk7i5gzt000nscvjm06m0bxx	HiFi Systems	hifi-systems	cmk7i3ion000lscvj5sk9o5nc	2	2026-01-09 23:23:28.457	2026-01-09 23:23:28.457	\N	\N	\N	f
cmk7i94mc000oscvjdle7gm0h	MP3 Players & Speakers	mp3-players-speakers	cmk7i3ion000lscvj5sk9o5nc	3	2026-01-09 23:26:19.044	2026-01-09 23:26:19.044	\N	\N	\N	f
cmk7iccb1000pscvj78aez6rw	 GAMES AND CONSOLES	games-and-consoles	cmk77ai990000scvj00m4ee13	6	2026-01-09 23:28:48.973	2026-01-09 23:28:48.973	\N	\N	\N	f
cmk7ies36000qscvjwhwr1h2p	Xbox One	xbox-one	cmk7iccb1000pscvj78aez6rw	1	2026-01-09 23:30:42.738	2026-01-09 23:30:42.738	\N	\N	\N	f
cmk7igxye000rscvjqfbuh4zl	Xbox 360	xbox-360	cmk7iccb1000pscvj78aez6rw	2	2026-01-09 23:32:23.654	2026-01-09 23:32:23.654	\N	\N	\N	f
cmk7ii62a000sscvjq0hq92a3	Nintendo Wii	nintendo-wii	cmk7iccb1000pscvj78aez6rw	3	2026-01-09 23:33:20.818	2026-01-09 23:33:20.818	\N	\N	\N	f
cmk7ikrn8000tscvj6slrwgld	PS4	ps4	cmk7iccb1000pscvj78aez6rw	4	2026-01-09 23:35:22.1	2026-01-09 23:35:22.1	\N	\N	\N	f
cmk7imgr7000uscvja44gdtlg	 PS3	ps3	cmk7iccb1000pscvj78aez6rw	4	2026-01-09 23:36:41.299	2026-01-09 23:36:41.299	\N	\N	\N	f
cmk7inatd000vscvj3e5udn2f	Sony PSP	sony-psp	cmk7iccb1000pscvj78aez6rw	5	2026-01-09 23:37:20.257	2026-01-09 23:37:20.257	\N	\N	\N	f
cmk7io965000wscvjxegooes9	PS Vita	ps-vita	cmk7iccb1000pscvj78aez6rw	6	2026-01-09 23:38:04.781	2026-01-09 23:38:04.781	\N	\N	\N	f
cmk7ip82u000xscvj7lmgtrbv	 Nintendo 3DS	nintendo-3ds	cmk7iccb1000pscvj78aez6rw	8	2026-01-09 23:38:50.022	2026-01-09 23:38:50.022	\N	\N	\N	f
cmk8b77880001m0vjx8q9ku9c	WOMEN'S WEAR	womens-wear	cmk8b587n0000m0vjyvlglzw4	1	2026-01-10 12:56:37.976	2026-01-10 12:56:37.976	\N	\N	\N	f
cmk8b7ul60002m0vj7diwj6tm	Dresses	dresses	cmk8b77880001m0vjx8q9ku9c	1	2026-01-10 12:57:08.249	2026-01-10 12:57:08.249	\N	\N	\N	f
cmk8bkg7u0003m0vjr6pgu6js	Trousers	trousers	cmk8b77880001m0vjx8q9ku9c	2	2026-01-10 13:06:56.154	2026-01-10 13:06:56.154	\N	\N	\N	f
cmk8m8o0d0004m0vjgovxqk4i	Tops	tops	cmk8b77880001m0vjx8q9ku9c	3	2026-01-10 18:05:42.157	2026-01-10 18:05:42.157	\N	\N	\N	f
cmk8ma58s0005m0vjaujh7zw3	Ready to Wear	ready-to-wear	cmk8b77880001m0vjx8q9ku9c	4	2026-01-10 18:06:51.148	2026-01-10 18:06:51.148	\N	\N	\N	f
cmk8mvhvi0006m0vjh5dy368k	 Co-ordinates	co-ordinates	cmk8b77880001m0vjx8q9ku9c	6	2026-01-10 18:23:27.294	2026-01-10 18:23:27.294	\N	\N	\N	f
cmk8mwkt00007m0vjlvvd1svu	Skirts	skirts	cmk8b77880001m0vjx8q9ku9c	7	2026-01-10 18:24:17.748	2026-01-10 18:24:17.748	\N	\N	\N	f
cmk8mx82m0008m0vjhipubq6t	Suits & Blazers	suits-blazers	cmk8b77880001m0vjx8q9ku9c	8	2026-01-10 18:24:47.894	2026-01-10 18:24:47.894	\N	\N	\N	f
cmk8mywi80009m0vjaw3hgfh2	Jumpsuits & Playsuits	jumpsuits-playsuits	cmk8b77880001m0vjx8q9ku9c	9	2026-01-10 18:26:06.224	2026-01-10 18:26:06.224	\N	\N	\N	f
cmk8n30da000am0vj6ahh8be7	MEN'S WEAR	mens-wear	cmk8b587n0000m0vjyvlglzw4	2	2026-01-10 18:29:17.854	2026-01-10 18:29:17.854	\N	\N	\N	f
cmk8n3p6w000bm0vjlz9n7vco	Shirts	shirts	cmk8n30da000am0vj6ahh8be7	1	2026-01-10 18:29:50.024	2026-01-10 18:29:50.024	\N	\N	\N	f
cmk8n4vxi000cm0vjcnidvyz4	T-Shirts	t-shirts	cmk8n30da000am0vj6ahh8be7	2	2026-01-10 18:30:45.414	2026-01-10 18:30:45.414	\N	\N	\N	f
cmk8n781n000dm0vjbcenwclz	Polos	polos	cmk8n30da000am0vj6ahh8be7	3	2026-01-10 18:32:34.427	2026-01-10 18:32:34.427	\N	\N	\N	f
cmk8n8cqc000em0vjwhj0xej6	Jeans	jeans	cmk8n30da000am0vj6ahh8be7	4	2026-01-10 18:33:27.156	2026-01-10 18:33:27.156	\N	\N	\N	f
cmk8n96pg000fm0vju3x733q4	Trousers & Shorts	trousers-shorts	cmk8n30da000am0vj6ahh8be7	5	2026-01-10 18:34:06.004	2026-01-10 18:34:06.004	\N	\N	\N	f
cmk8n9syw000gm0vjcqg0b785	Pyjamas	pyjamas	cmk8n30da000am0vj6ahh8be7	6	2026-01-10 18:34:34.856	2026-01-10 18:34:34.856	\N	\N	\N	f
cmk8nd472000hm0vjuhknxsxs	Suits, Blazers & Jackets	suits-blazers-jackets	cmk8n30da000am0vj6ahh8be7	7	2026-01-10 18:37:09.374	2026-01-10 18:37:09.374	\N	\N	\N	f
cmk8ng5wt000im0vjw15tszyf	Jerseys	jerseys	cmk8n30da000am0vj6ahh8be7	8	2026-01-10 18:39:31.564	2026-01-10 18:39:31.564	\N	\N	\N	f
cmk8nhzio000jm0vjxarz7efs	Traditional Wear	traditional-wear	cmk8n30da000am0vj6ahh8be7	9	2026-01-10 18:40:56.592	2026-01-10 18:40:56.592	\N	\N	\N	f
cmk8nlznj000km0vj7u2288tl	 WATCHES	watches	cmk8b587n0000m0vjyvlglzw4	3	2026-01-10 18:44:03.391	2026-01-10 18:44:03.391	\N	\N	\N	f
cmk8nok5f000lm0vjkeu3aetp	Women's Watches	womens-watches	cmk8nlznj000km0vj7u2288tl	1	2026-01-10 18:46:03.267	2026-01-10 18:46:03.267	\N	\N	\N	f
cmk8nu6xq000mm0vj2yi08jou	Men's Watches	mens-watches	cmk8nlznj000km0vj7u2288tl	2	2026-01-10 18:50:26.078	2026-01-10 18:50:26.078	\N	\N	\N	f
cmk8o50l3000om0vj0jqadmeo	Unisex Watches	unisex-watches-2	cmk8nlznj000km0vj7u2288tl	3	2026-01-10 18:58:51.062	2026-01-10 18:58:51.062	\N	\N	\N	f
cmk8z7gkq000pm0vjnqqmrfvw	WEDDING SHOP	wedding-shop	cmk8b587n0000m0vjyvlglzw4	4	2026-01-11 00:08:40.874	2026-01-11 00:08:40.874	\N	\N	\N	f
cmk8zgv4h000qm0vjh08xno0r	 Women's Wedding Shop	womens-wedding-shop	cmk8z7gkq000pm0vjnqqmrfvw	1	2026-01-11 00:15:59.633	2026-01-11 00:15:59.633	\N	\N	\N	f
cmk8zhtsb000rm0vjixve2sgw	Men's Wedding Shop	mens-wedding-shop	cmk8z7gkq000pm0vjnqqmrfvw	2	2026-01-11 00:16:44.555	2026-01-11 00:16:44.555	\N	\N	\N	f
cmkaavjs60000i4vjqsxsohnq	WOMEN'S SHOE	womens-shoe	cmk8b587n0000m0vjyvlglzw4	5	2026-01-11 22:23:06.726	2026-01-11 22:23:06.726	\N	\N	\N	f
cmkacq0e60005i4vjenczjey7	 Shoes & Bags	shoes-bags	cmkaavjs60000i4vjqsxsohnq	1	2026-01-11 23:14:47.55	2026-01-11 23:14:47.55	\N	\N	\N	f
cmkacv9uz0006i4vjctwtdh4t	Sport Shoes	sport-shoes	cmkaavjs60000i4vjqsxsohnq	2	2026-01-11 23:18:53.098	2026-01-11 23:18:53.098	\N	\N	\N	f
cmkacvxqj0007i4vjftctmawv	Wedges	wedges	cmkaavjs60000i4vjqsxsohnq	3	2026-01-11 23:19:24.043	2026-01-11 23:19:24.043	\N	\N	\N	f
cmkacwj9i0008i4vjgz34jrow	 Sandals & Slippers	sandals-slippers	cmkaavjs60000i4vjqsxsohnq	4	2026-01-11 23:19:51.942	2026-01-11 23:19:51.942	\N	\N	\N	f
cmkacx5dw0009i4vjj5700kes	Heels	heels	cmkaavjs60000i4vjqsxsohnq	0	2026-01-11 23:20:20.612	2026-01-11 23:20:20.612	\N	\N	\N	f
cmkacxq6r000ai4vjki3nyf1a	Ballerinas & Flats	ballerinas-flats	cmkaavjs60000i4vjqsxsohnq	0	2026-01-11 23:20:47.571	2026-01-11 23:20:47.571	\N	\N	\N	f
cmkacyxz5000bi4vjgsgu4nvp	MEN'S SHOE	mens-shoe	cmk8b587n0000m0vjyvlglzw4	6	2026-01-11 23:21:44.321	2026-01-11 23:21:44.321	\N	\N	\N	f
cmkad0sr7000ci4vjokitfbrm	Formal Shoes	formal-shoes	cmkacyxz5000bi4vjgsgu4nvp	1	2026-01-11 23:23:10.867	2026-01-11 23:23:10.867	\N	\N	\N	f
cmkad1hrk000di4vjl0w9rd3k	Casual Shoes	casual-shoes	cmkacyxz5000bi4vjgsgu4nvp	2	2026-01-11 23:23:43.28	2026-01-11 23:23:43.28	\N	\N	\N	f
cmkad51vd000ei4vjxglskvuv	Reusable Bags	reusable-bags	cmkacyxz5000bi4vjgsgu4nvp	3	2026-01-11 23:26:29.305	2026-01-11 23:26:29.305	\N	\N	\N	f
cmkad5vql000fi4vj7gdbhwe8	Slippers & Sandals	slippers-sandals	cmkacyxz5000bi4vjgsgu4nvp	4	2026-01-11 23:27:08.013	2026-01-11 23:27:08.013	\N	\N	\N	f
cmkad6h1h000gi4vjbxir8pty	Shoe Care & Accessories	shoe-care-accessories	cmkacyxz5000bi4vjgsgu4nvp	5	2026-01-11 23:27:35.621	2026-01-11 23:27:35.621	\N	\N	\N	f
cmkad7tvy000hi4vj60pu3uag	 WOMEN'S STYLE FINDER	womens-style-finder	cmk8b587n0000m0vjyvlglzw4	7	2026-01-11 23:28:38.925	2026-01-11 23:28:38.925	\N	\N	\N	f
cmkad8f64000ii4vj19t37rts	Monochrome	monochrome	cmkad7tvy000hi4vj60pu3uag	1	2026-01-11 23:29:06.508	2026-01-11 23:29:06.508	\N	\N	\N	f
cmkad8tk8000ji4vjv1ze0xm6	Floral	floral	cmkad7tvy000hi4vj60pu3uag	2	2026-01-11 23:29:25.16	2026-01-11 23:29:25.16	\N	\N	\N	f
cmkad9k77000ki4vjtk03h71v	 Bold in Black	bold-in-black	cmkad7tvy000hi4vj60pu3uag	3	2026-01-11 23:29:59.683	2026-01-11 23:29:59.683	\N	\N	\N	f
cmkada7vg000li4vjuxa5j5yv	9 to 5 Chic	9-to-5-chic	cmkad7tvy000hi4vj60pu3uag	4	2026-01-11 23:30:30.364	2026-01-11 23:30:30.364	\N	\N	\N	f
cmkadaxm3000mi4vjrr6c971a	Trending Now	trending-now	cmkad7tvy000hi4vj60pu3uag	5	2026-01-11 23:31:03.723	2026-01-11 23:31:03.723	\N	\N	\N	f
cmkadcav9000ni4vj384u6xm2	Red Hot	red-hot	cmkad7tvy000hi4vj60pu3uag	6	2026-01-11 23:32:07.557	2026-01-11 23:32:07.557	\N	\N	\N	f
cmkae4206000oi4vjsq9l83v7	WOMEN'S ACCESSORIES	womens-accessories	cmk8b587n0000m0vjyvlglzw4	7	2026-01-11 23:53:42.437	2026-01-11 23:53:42.437	\N	\N	\N	f
cmkae4sel000pi4vjmxnns6iu	Hats & Scarves	hats-scarves	cmkae4206000oi4vjsq9l83v7	1	2026-01-11 23:54:16.653	2026-01-11 23:54:16.653	\N	\N	\N	f
cmkae5d4z000qi4vjsic388co	Jewellery	jewellery	cmkae4206000oi4vjsq9l83v7	2	2026-01-11 23:54:43.522	2026-01-11 23:54:43.522	\N	\N	\N	f
cmkae5pml000ri4vjouxxjjk6	Wallets	wallets	cmkae4206000oi4vjsq9l83v7	0	2026-01-11 23:54:59.709	2026-01-11 23:54:59.709	\N	\N	\N	f
cmkae6blk000si4vjvv089qwe	 Purses & Clutches	purses-clutches	cmkae4206000oi4vjsq9l83v7	4	2026-01-11 23:55:28.184	2026-01-11 23:55:28.184	\N	\N	\N	f
cmkae6sqy000ti4vjk4tjl6ii	Belts	belts	cmkae4206000oi4vjsq9l83v7	5	2026-01-11 23:55:50.41	2026-01-11 23:55:50.41	\N	\N	\N	f
cmkae79fk000ui4vjctepwnk8	 Bags	bags	cmkae4206000oi4vjsq9l83v7	6	2026-01-11 23:56:12.032	2026-01-11 23:56:12.032	\N	\N	\N	f
cmkaejcxz0010i4vj6wjxkadm	Caps & Hats	caps-hats	cmkaebzh2000vi4vjcxav3gty	4	2026-01-12 00:05:36.455	2026-01-12 00:05:36.455	\N	\N	\N	f
cmkaek3vv0011i4vjz5t5eylv	Socks & Underwear	socks-underwear	cmkaebzh2000vi4vjcxav3gty	5	2026-01-12 00:06:11.371	2026-01-12 00:06:11.371	\N	\N	\N	f
cmkaekk3q0012i4vj9h8sw0u5	Belts & Wallets	belts-wallets	cmkaebzh2000vi4vjcxav3gty	6	2026-01-12 00:06:32.39	2026-01-12 00:06:32.39	\N	\N	\N	f
cmkaelefu0013i4vjjgqwit9v	MEN'S STYLE FINDER	mens-style-finder	cmk8b587n0000m0vjyvlglzw4	10	2026-01-12 00:07:11.706	2026-01-12 00:07:11.706	\N	\N	\N	f
cmkaeml9l0014i4vj1v91ywbw	Monochrome	monochrome-2	cmkaelefu0013i4vjjgqwit9v	1	2026-01-12 00:08:07.209	2026-01-12 00:08:07.209	\N	\N	\N	f
cmkaen4ay0015i4vj35myg8c1	 Wardrobe Basics	wardrobe-basics	cmkaelefu0013i4vjjgqwit9v	2	2026-01-12 00:08:31.882	2026-01-12 00:08:31.882	\N	\N	\N	f
cmkaenqe50016i4vjy8b05yx2	Prints	prints	cmkaelefu0013i4vjjgqwit9v	3	2026-01-12 00:09:00.509	2026-01-12 00:09:00.509	\N	\N	\N	f
cmkaeoefg0017i4vjlas8vpb3	Wardrobe Basics	wardrobe-basics-2	cmkaelefu0013i4vjjgqwit9v	4	2026-01-12 00:09:31.66	2026-01-12 00:09:31.66	\N	\N	\N	f
cmkaeoz5x0018i4vjyj599k49	Men in Blue	men-in-blue	cmkaelefu0013i4vjjgqwit9v	5	2026-01-12 00:09:58.533	2026-01-12 00:09:58.533	\N	\N	\N	f
cmkaezzed001ki4vj2tutykql	Shoes	shoes-2	cmkaewu9n001hi4vjjo591oxi	3	2026-01-12 00:18:32.053	2026-01-12 00:18:32.053	\N	\N	\N	f
cmkaebzh2000vi4vjcxav3gty	MEN'S ACCESSORIES	mens-accessories	cmk8b587n0000m0vjyvlglzw4	9	2026-01-11 23:59:52.406	2026-01-11 23:59:52.406	\N	\N	\N	f
cmkaecgve000wi4vju1zmu8gd	Ties & Cufflinks	ties-cufflinks	cmkaebzh2000vi4vjcxav3gty	0	2026-01-12 00:00:14.954	2026-01-12 00:00:14.954	\N	\N	\N	f
cmkaehxm4000yi4vjlhgt7njd	Bags	bags-2	cmkaebzh2000vi4vjcxav3gty	2	2026-01-12 00:04:29.932	2026-01-12 00:04:29.932	\N	\N	\N	f
cmkaeiqs1000zi4vjwy13pjxr	Jewellery	jewellery-2	cmkaebzh2000vi4vjcxav3gty	3	2026-01-12 00:05:07.729	2026-01-12 00:05:07.729	\N	\N	\N	f
cmkaepkz30019i4vj91clqekt	Business Look	business-look	cmkaelefu0013i4vjjgqwit9v	6	2026-01-12 00:10:26.799	2026-01-12 00:10:26.799	\N	\N	\N	f
cmkaerw2b001ai4vjlfuzgb21	FASHION BUNDLES	fashion-bundles	cmk8b587n0000m0vjyvlglzw4	11	2026-01-12 00:12:14.483	2026-01-12 00:12:14.483	\N	\N	\N	f
cmkaesjly001bi4vjbpuf6ev6	Women's Fashion Bundles	womens-fashion-bundles	cmkaerw2b001ai4vjlfuzgb21	1	2026-01-12 00:12:44.998	2026-01-12 00:12:44.998	\N	\N	\N	f
cmkaet7zz001ci4vjkf0oswc7	Men's Fashion Bundles	mens-fashion-bundles	cmkaerw2b001ai4vjlfuzgb21	2	2026-01-12 00:13:16.607	2026-01-12 00:13:16.607	\N	\N	\N	f
cmkaetqr0001di4vjyvkjoaif	BOYS	boys	cmk8b587n0000m0vjyvlglzw4	12	2026-01-12 00:13:40.908	2026-01-12 00:13:40.908	\N	\N	\N	f
cmkaeurio001ei4vj0fkyrxy5	Accessories	accessories-2	cmkaetqr0001di4vjyvkjoaif	1	2026-01-12 00:14:28.56	2026-01-12 00:14:28.56	\N	\N	\N	f
cmkaevisd001fi4vj2iu8qie3	Clothing	clothing	cmkaetqr0001di4vjyvkjoaif	2	2026-01-12 00:15:03.901	2026-01-12 00:15:03.901	\N	\N	\N	f
cmkaew4ld001gi4vjxql7nerx	Shoes	shoes	cmkaetqr0001di4vjyvkjoaif	3	2026-01-12 00:15:32.161	2026-01-12 00:15:32.161	\N	\N	\N	f
cmkaewu9n001hi4vjjo591oxi	GIRLS	girls	cmk8b587n0000m0vjyvlglzw4	12	2026-01-12 00:16:05.435	2026-01-12 00:16:05.435	\N	\N	\N	f
cmkaeyu5l001ii4vj5rh3zmf0	Accessories	accessories-3	cmkaewu9n001hi4vjjo591oxi	1	2026-01-12 00:17:38.601	2026-01-12 00:17:38.601	\N	\N	\N	f
cmkaezbbj001ji4vjjfxd5ote	Clothing	clothing-2	cmkaewu9n001hi4vjjo591oxi	2	2026-01-12 00:18:00.847	2026-01-12 00:18:00.847	\N	\N	\N	f
cmkbagvd9000510vjt0ydgxei	HOME FURNISHINGS	home-furnishings	cmkba94sa000010vjoyg1xkxm	1	2026-01-12 14:59:28.077	2026-01-12 14:59:28.077	\N	\N	\N	f
cmkbaigva000610vjw2a13c3q	Bed & Bathroom Furnishings	bed-bathroom-furnishings	cmkbagvd9000510vjt0ydgxei	1	2026-01-12 15:00:42.598	2026-01-12 15:00:42.598	\N	\N	\N	f
cmkbaj0uh000710vjuf1wfdrv	Curtains & Blinds	curtains-blinds	cmkbagvd9000510vjt0ydgxei	2	2026-01-12 15:01:08.488	2026-01-12 15:01:08.488	\N	\N	\N	f
cmkbajfy7000810vjh1y1qeon	Decor	decor	cmkbagvd9000510vjt0ydgxei	4	2026-01-12 15:01:28.063	2026-01-12 15:01:28.063	\N	\N	\N	f
cmkbal1a8000910vjmt2cyxj2	Light Fixtures	light-fixtures	cmkbagvd9000510vjt0ydgxei	4	2026-01-12 15:02:42.368	2026-01-12 15:02:42.368	\N	\N	\N	f
cmkbalgrz000a10vjg9j5b03h	Rugs & Carpets	rugs-carpets	cmkbagvd9000510vjt0ydgxei	5	2026-01-12 15:03:02.447	2026-01-12 15:03:02.447	\N	\N	\N	f
cmkbam6uh000b10vjsrf6ma8m	Housekeeping & Pet Supplies	housekeeping-pet-supplies	cmkbagvd9000510vjt0ydgxei	6	2026-01-12 15:03:36.233	2026-01-12 15:03:36.233	\N	\N	\N	f
cmkbblpt4000c10vjez13hpxf	KITCHEN & DINING	kitchen-dining	cmkba94sa000010vjoyg1xkxm	2	2026-01-12 15:31:13.768	2026-01-12 15:31:13.768	\N	\N	\N	f
cmkbbw06x000e10vj09wcbpek	Cook and Bakeware	cook-and-bakeware	cmkbblpt4000c10vjez13hpxf	1	2026-01-12 15:39:13.784	2026-01-12 15:39:13.784	\N	\N	\N	f
cmkbbwji2000f10vj5u6m8tzh	Dining	dining	cmkbblpt4000c10vjez13hpxf	2	2026-01-12 15:39:38.81	2026-01-12 15:39:38.81	\N	\N	\N	f
cmkbbx0j5000g10vjnk3v3zkd	Kitchen Utensils	kitchen-utensils	cmkbblpt4000c10vjez13hpxf	3	2026-01-12 15:40:00.881	2026-01-12 15:40:00.881	\N	\N	\N	f
cmkbc035f000h10vjghlzxth4	Cooker Hoods & Ventilators	cooker-hoods-ventilators	cmkbblpt4000c10vjez13hpxf	4	2026-01-12 15:42:24.242	2026-01-12 15:42:24.242	\N	\N	\N	f
cmkbc0j3b000i10vjy6lrvd7i	Storage Chests	storage-chests	cmkbblpt4000c10vjez13hpxf	5	2026-01-12 15:42:44.903	2026-01-12 15:42:44.903	\N	\N	\N	f
cmkbc15up000j10vj3gm5nty7	LARGE APPLIANCES	large-appliances	cmkba94sa000010vjoyg1xkxm	3	2026-01-12 15:43:14.401	2026-01-12 15:43:14.401	\N	\N	\N	f
cmkbc2r2e000k10vjwu2srmqs	Air Conditioners & Coolers	air-conditioners-coolers	cmkbc15up000j10vj3gm5nty7	1	2026-01-12 15:44:28.55	2026-01-12 15:44:28.55	\N	\N	\N	f
cmkbc3auu000l10vjkgifwzf9	Fans	fans	cmkbc15up000j10vj3gm5nty7	2	2026-01-12 15:44:54.198	2026-01-12 15:44:54.198	\N	\N	\N	f
cmkbc3vsv000m10vjfgfr2hc3	Freezers	freezers	cmkbc15up000j10vj3gm5nty7	3	2026-01-12 15:45:21.343	2026-01-12 15:45:21.343	\N	\N	\N	f
cmkbc4bxb000n10vjv8zq98jn	Washers & Dryers	washers-dryers	cmkbc15up000j10vj3gm5nty7	4	2026-01-12 15:45:42.239	2026-01-12 15:45:42.239	\N	\N	\N	f
cmkbc5ke1000o10vjs6l5avog	Refrigerators	refrigerators	cmkbc15up000j10vj3gm5nty7	5	2026-01-12 15:46:39.865	2026-01-12 15:46:39.865	\N	\N	\N	f
cmkbc5ys9000p10vj05ls8mjt	Cookers & Ovens	cookers-ovens	cmkbc15up000j10vj3gm5nty7	6	2026-01-12 15:46:58.521	2026-01-12 15:46:58.521	\N	\N	\N	f
cmkbc6mfp000q10vjofpweqdh	Water Dispensers	water-dispensers	cmkbc15up000j10vj3gm5nty7	7	2026-01-12 15:47:29.173	2026-01-12 15:47:29.173	\N	\N	\N	f
cmkbc7hwr000r10vjc932zbnw	Vacuum Cleaners	vacuum-cleaners	cmkbc15up000j10vj3gm5nty7	8	2026-01-12 15:48:09.962	2026-01-12 15:48:09.962	\N	\N	\N	f
cmkbc8xqr000s10vju7lppmuw	FURNITURE	furniture	cmkba94sa000010vjoyg1xkxm	4	2026-01-12 15:49:17.138	2026-01-12 15:49:17.138	\N	\N	\N	f
cmkbcl697000t10vjf6pxffu2	Living Room Furniture	living-room-furniture	cmkbc8xqr000s10vju7lppmuw	1	2026-01-12 15:58:48.043	2026-01-12 15:58:48.043	\N	\N	\N	f
cmkbclthv000u10vjea4tcmsz	Bedroom Furniture	bedroom-furniture	cmkbc8xqr000s10vju7lppmuw	2	2026-01-12 15:59:18.163	2026-01-12 15:59:18.163	\N	\N	\N	f
cmkbcme7i000v10vjqv593xsp	Office Furniture	office-furniture	cmkbc8xqr000s10vju7lppmuw	3	2026-01-12 15:59:45.006	2026-01-12 15:59:45.006	\N	\N	\N	f
cmkbcnxal000w10vjb4affqvy	Kitchen & Dining Furniture	kitchen-dining-furniture	cmkbc8xqr000s10vju7lppmuw	4	2026-01-12 16:00:56.397	2026-01-12 16:00:56.397	\N	\N	\N	f
cmkbcomtt000x10vje4r1and3	Bookcases	bookcases	cmkbc8xqr000s10vju7lppmuw	5	2026-01-12 16:01:29.489	2026-01-12 16:01:29.489	\N	\N	\N	f
cmkbcpuhz000y10vjrciyv59u	SMALL APPLIANCES	small-appliances	cmkba94sa000010vjoyg1xkxm	5	2026-01-12 16:02:26.087	2026-01-12 16:02:26.087	\N	\N	\N	f
cmkbcu3ot000z10vjxalrezjz	 Blenders, Juicers & Mixers	blenders-juicers-mixers	cmkbcpuhz000y10vjrciyv59u	1	2026-01-12 16:05:44.621	2026-01-12 16:05:44.621	\N	\N	\N	f
cmkbcuodo001010vj575mwklb	Hot Plates & Burners	hot-plates-burners	cmkbcpuhz000y10vjrciyv59u	2	2026-01-12 16:06:11.436	2026-01-12 16:06:11.436	\N	\N	\N	f
cmkbdkmgh001110vjfwg2iwhk	Irons & Steamers	irons-steamers	cmkbcpuhz000y10vjrciyv59u	3	2026-01-12 16:26:22.001	2026-01-12 16:26:22.001	\N	\N	\N	f
cmkbdlxfw001210vjs6isdhri	Kids Bedroom	kids-bedroom	cmkbcpuhz000y10vjrciyv59u	4	2026-01-12 16:27:22.892	2026-01-12 16:27:22.892	\N	\N	\N	f
cmkbdm9tg001310vjn5sof9xa	Processors & Mincers	processors-mincers-2	cmkbcpuhz000y10vjrciyv59u	5	2026-01-12 16:27:38.932	2026-01-12 16:33:39.378	\N	\N	\N	f
cmkbdxrck001410vjjromz5li	Toasters & Sandwich Makers	toasters-sandwich-makers-2	cmkbcpuhz000y10vjrciyv59u	6	2026-01-12 16:36:34.868	2026-01-12 16:37:30.752	\N	\N	\N	f
cmkbdzyze001510vjijbjutk8	Deep Fryers & Rice Cookers	deep-fryers-rice-cookers	cmkbcpuhz000y10vjrciyv59u	7	2026-01-12 16:38:18.074	2026-01-12 16:38:18.074	\N	\N	\N	f
cmkbe0f4c001610vjrjk74juo	Electric Kettles	electric-kettles	cmkbcpuhz000y10vjrciyv59u	8	2026-01-12 16:38:38.988	2026-01-12 16:38:38.988	\N	\N	\N	f
cmkbe17ug001710vjds6hmgc0	Microwaves	microwaves	cmkbcpuhz000y10vjrciyv59u	9	2026-01-12 16:39:16.216	2026-01-12 16:39:16.216	\N	\N	\N	f
cmkbe1req001810vjju4g7zyd	Yam Pounder	yam-pounder	cmkbcpuhz000y10vjrciyv59u	10	2026-01-12 16:39:41.57	2026-01-12 16:39:41.57	\N	\N	\N	f
cmkbe51up001910vj5vpuqul1	OTHERS	others	cmkba94sa000010vjoyg1xkxm	6	2026-01-12 16:42:15.073	2026-01-12 16:42:15.073	\N	\N	\N	f
cmkbe5jr9001a10vj14zldd6l	Umbrellas	umbrellas	cmkbe51up001910vj5vpuqul1	1	2026-01-12 16:42:38.277	2026-01-12 16:42:38.277	\N	\N	\N	f
cmkbe6kye001b10vjdxjq9ush	Towel Racks	towel-racks	cmkbe51up001910vj5vpuqul1	2	2026-01-12 16:43:26.486	2026-01-12 16:43:26.486	\N	\N	\N	f
cmkbe75wo001c10vj69gkm9ih	Garment Steamers	garment-steamers	cmkbe51up001910vj5vpuqul1	3	2026-01-12 16:43:53.64	2026-01-12 16:43:53.64	\N	\N	\N	f
cmkbe7q8k001d10vjlr03f12z	Rain Boots & Raincoats	rain-boots-raincoats	cmkbe51up001910vj5vpuqul1	4	2026-01-12 16:44:19.988	2026-01-12 16:44:19.988	\N	\N	\N	f
cmkbe8jsp001e10vj3xbdukkl	Gas Cylinder & Accessories	gas-cylinder-accessories	cmkbe51up001910vj5vpuqul1	5	2026-01-12 16:44:58.297	2026-01-12 16:44:58.297	\N	\N	\N	f
cmkbetj5k001f10vjjtj87v15	Baby, Kids and Toys	baby-kids-and-toys	\N	6	2026-01-12 17:01:17.24	2026-01-12 17:01:17.24	\N	\N	\N	f
cmkbeuxlg001g10vjhz0lmha6	 FASHION FOR GIRLS	fashion-for-girls	cmkbetj5k001f10vjjtj87v15	1	2026-01-12 17:02:22.612	2026-01-12 17:02:22.612	\N	\N	\N	f
cmkbex4v7001h10vj1pyood8i	Dresses	dresses-2	cmkbeuxlg001g10vjhz0lmha6	1	2026-01-12 17:04:05.347	2026-01-12 17:04:05.347	\N	\N	\N	f
cmkbezm9o001i10vjob4jirah	Sets	sets	cmkbeuxlg001g10vjhz0lmha6	2	2026-01-12 17:06:01.212	2026-01-12 17:06:01.212	\N	\N	\N	f
cmkbf00m6001j10vjcci0nlhd	Tops, Jackets & Sweatshirts	tops-jackets-sweatshirts	cmkbeuxlg001g10vjhz0lmha6	3	2026-01-12 17:06:19.806	2026-01-12 17:06:19.806	\N	\N	\N	f
cmkbf1hft001k10vjnbc4dxjh	Denim, Trousers & Leggings	denim-trousers-leggings	cmkbeuxlg001g10vjhz0lmha6	4	2026-01-12 17:07:28.265	2026-01-12 17:07:28.265	\N	\N	\N	f
cmkbf2345001l10vj87kei7mv	 Underwear & Socks	underwear-socks	cmkbeuxlg001g10vjhz0lmha6	5	2026-01-12 17:07:56.357	2026-01-12 17:07:56.357	\N	\N	\N	f
cmkbf2kb9001m10vjulz1a5j6	 Watches	watches-2	cmkbeuxlg001g10vjhz0lmha6	6	2026-01-12 17:08:18.645	2026-01-12 17:08:18.645	\N	\N	\N	f
cmkbf5dde001n10vj1zfytvft	Shoes	shoes-3	cmkbeuxlg001g10vjhz0lmha6	7	2026-01-12 17:10:29.618	2026-01-12 17:10:29.618	\N	\N	\N	f
cmkbf71c3001o10vjicrf4078	Sleepwear	sleepwear	cmkbeuxlg001g10vjhz0lmha6	8	2026-01-12 17:11:47.331	2026-01-12 17:11:47.331	\N	\N	\N	f
cmkbf83gh001p10vjbxgh10qx	Bodysuits & Playsuits	bodysuits-playsuits	cmkbeuxlg001g10vjhz0lmha6	8	2026-01-12 17:12:36.737	2026-01-12 17:12:36.737	\N	\N	\N	f
cmkbf9d93001q10vj6zuodp5l	 SCHOOL STORE	school-store	cmkbetj5k001f10vjjtj87v15	2	2026-01-12 17:13:36.087	2026-01-12 17:13:36.087	\N	\N	\N	f
cmkbfa121001r10vjpmbv9816	Bags & Backpacks	bags-backpacks	cmkbf9d93001q10vj6zuodp5l	1	2026-01-12 17:14:06.937	2026-01-12 17:14:06.937	\N	\N	\N	f
cmkbfamol001s10vj4h4xis3q	 Lunchboxes & Waterbottles	lunchboxes-waterbottles	cmkbf9d93001q10vj6zuodp5l	2	2026-01-12 17:14:34.965	2026-01-12 17:14:34.965	\N	\N	\N	f
cmkbg693x001t10vj64vvg2k7	School Uniform & Accessories	school-uniform-accessories	cmkbf9d93001q10vj6zuodp5l	3	2026-01-12 17:39:10.365	2026-01-12 17:39:10.365	\N	\N	\N	f
cmkbg6she001u10vj09s88u5r	Hallway Units	hallway-units	cmkbf9d93001q10vj6zuodp5l	4	2026-01-12 17:39:35.474	2026-01-12 17:39:35.474	\N	\N	\N	f
cmkbga66s001v10vjizrbqd0q	 BEDDING & DECORATION	bedding-decoration	cmkbetj5k001f10vjjtj87v15	3	2026-01-12 17:42:13.204	2026-01-12 17:42:13.204	\N	\N	\N	f
cmkbgbm9t001w10vj458sgvet	 Furniture	furniture-2	cmkbga66s001v10vjizrbqd0q	1	2026-01-12 17:43:20.705	2026-01-12 17:43:20.705	\N	\N	\N	f
cmkbgcbag001x10vj7zcj1ctj	 Bedding	bedding	cmkbga66s001v10vjizrbqd0q	2	2026-01-12 17:43:53.128	2026-01-12 17:43:53.128	\N	\N	\N	f
cmkbgdl4y001y10vj622hkyxb	Decor Accessories	decor-accessories	cmkbga66s001v10vjizrbqd0q	3	2026-01-12 17:44:52.546	2026-01-12 17:44:52.546	\N	\N	\N	f
cmkbgebw8001z10vj9a23o17m	FASHION FOR BOYS	fashion-for-boys	cmkbetj5k001f10vjjtj87v15	4	2026-01-12 17:45:27.224	2026-01-12 17:45:27.224	\N	\N	\N	f
cmkbgu14a002010vjs6vb5tti	 Shirts	shirts-2	cmkbgebw8001z10vj9a23o17m	1	2026-01-12 17:57:39.754	2026-01-12 17:57:39.754	\N	\N	\N	f
cmkbgupjz002110vjk13us93a	 Shoes	shoes-4	cmkbgebw8001z10vj9a23o17m	2	2026-01-12 17:58:11.423	2026-01-12 17:58:11.423	\N	\N	\N	f
cmkbgvafk002210vj0gfpvlvs	Underwear & Socks	underwear-socks-2	cmkbgebw8001z10vj9a23o17m	3	2026-01-12 17:58:38.48	2026-01-12 17:58:38.48	\N	\N	\N	f
cmkbgw702002310vjzzi0ag8d	Sleepwear	sleepwear-2	cmkbgebw8001z10vj9a23o17m	4	2026-01-12 17:59:20.689	2026-01-12 17:59:20.689	\N	\N	\N	f
cmkbgxc9t002410vj9mjx240l	Bodysuits & Playsuits	bodysuits-playsuits-2	cmkbgebw8001z10vj9a23o17m	5	2026-01-12 18:00:14.177	2026-01-12 18:00:14.177	\N	\N	\N	f
cmkbgy07h002510vjtx3pduho	Denim & Trousers	denim-trousers	cmkbgebw8001z10vj9a23o17m	6	2026-01-12 18:00:45.197	2026-01-12 18:00:45.197	\N	\N	\N	f
cmkbgywfc002610vjz3pr0w0k	Watches	watches-3	cmkbgebw8001z10vj9a23o17m	7	2026-01-12 18:01:26.952	2026-01-12 18:01:26.952	\N	\N	\N	f
cmkbgzhd2002710vjdx2bs3cv	Sets	sets-2	cmkbgebw8001z10vj9a23o17m	8	2026-01-12 18:01:54.086	2026-01-12 18:01:54.086	\N	\N	\N	f
cmkbh0jwe002810vjtqa3t603	Polos & T-Shirts	polos-t-shirts	cmkbgebw8001z10vj9a23o17m	9	2026-01-12 18:02:44.03	2026-01-12 18:02:44.03	\N	\N	\N	f
cmkbh39sl002910vj4asjy9il	TRAVEL & SAFETY GEARS	travel-safety-gears	cmkbetj5k001f10vjjtj87v15	5	2026-01-12 18:04:50.901	2026-01-12 18:04:50.901	\N	\N	\N	f
cmkbh64t3002a10vjqo7njyxh	Car Seats, Strollers & Carriers	car-seats-strollers-carriers	cmkbh39sl002910vj4asjy9il	1	2026-01-12 18:07:04.407	2026-01-12 18:07:04.407	\N	\N	\N	f
cmkbh7zxj002b10vjye63va1f	High Chairs & Booster Seats	high-chairs-booster-seats	cmkbh39sl002910vj4asjy9il	2	2026-01-12 18:08:31.398	2026-01-12 18:08:31.398	\N	\N	\N	f
cmkbh8hd7002c10vji9j7i4vo	Mobile Beds & Nets	mobile-beds-nets	cmkbh39sl002910vj4asjy9il	3	2026-01-12 18:08:53.995	2026-01-12 18:08:53.995	\N	\N	\N	f
cmkbh9wk4002d10vj13vqdjd4	Baby Monitors & Safety Gates	baby-monitors-safety-gates	cmkbh39sl002910vj4asjy9il	4	2026-01-12 18:10:00.34	2026-01-12 18:10:00.34	\N	\N	\N	f
cmkbhaqfu002e10vjtczff9q4	DIAPERING & DAILY CARE	diapering-daily-care	cmkbetj5k001f10vjjtj87v15	6	2026-01-12 18:10:39.066	2026-01-12 18:10:39.066	\N	\N	\N	f
cmkbhcp13002f10vjuzx5l55a	Daily Care	daily-care	cmkbhaqfu002e10vjtczff9q4	6	2026-01-12 18:12:10.551	2026-01-12 18:12:10.551	\N	\N	\N	f
cmkbhd31p002g10vjs4wl39or	Bathtime Essentials	bathtime-essentials	cmkbhaqfu002e10vjtczff9q4	2	2026-01-12 18:12:28.717	2026-01-12 18:12:28.717	\N	\N	\N	f
cmkbhdq0c002h10vjlm9x5hon	Diaper Bags & Changing Mats	diaper-bags-changing-mats	cmkbhaqfu002e10vjtczff9q4	3	2026-01-12 18:12:58.476	2026-01-12 18:12:58.476	\N	\N	\N	f
cmkbhedfd002i10vj7ajwb0dr	 Diapers & Baby Wipes	diapers-baby-wipes	cmkbhaqfu002e10vjtczff9q4	4	2026-01-12 18:13:28.825	2026-01-12 18:13:28.825	\N	\N	\N	f
cmkbhfmko002j10vjeorb39u3	 Potty Training	potty-training	cmkbhaqfu002e10vjtczff9q4	5	2026-01-12 18:14:27.336	2026-01-12 18:14:27.336	\N	\N	\N	f
cmkbhg362002k10vju7p8m3nf	BABY ESSENTIALS	baby-essentials	cmkbetj5k001f10vjjtj87v15	7	2026-01-12 18:14:48.842	2026-01-12 18:14:48.842	\N	\N	\N	f
cmkbhzu2h002l10vja5j2ww4l	Bibs & Burp Cloths	bibs-burp-cloths	cmkbhg362002k10vju7p8m3nf	1	2026-01-12 18:30:10.169	2026-01-12 18:30:10.169	\N	\N	\N	f
cmkbi0e0j002m10vjecfcimpv	 Bottle Feeding	bottle-feeding	cmkbhg362002k10vju7p8m3nf	2	2026-01-12 18:30:36.019	2026-01-12 18:30:36.019	\N	\N	\N	f
cmkbi14qa002n10vjsomz276h	Breastfeeding	breastfeeding	cmkbhg362002k10vju7p8m3nf	3	2026-01-12 18:31:10.641	2026-01-12 18:31:10.641	\N	\N	\N	f
cmkbi1o5d002o10vjakf9uewg	 Pacifiers & Teethers	pacifiers-teethers	cmkbhg362002k10vju7p8m3nf	4	2026-01-12 18:31:35.809	2026-01-12 18:31:35.809	\N	\N	\N	f
cmkbi2eqs002p10vj1tx8kpce	Baby Food & Formula	baby-food-formula	cmkbhg362002k10vju7p8m3nf	5	2026-01-12 18:32:10.276	2026-01-12 18:32:10.276	\N	\N	\N	f
cmkbi3bm8002q10vj1pnoh5bg	Feeding & Nursing	feeding-nursing	cmkbhg362002k10vju7p8m3nf	6	2026-01-12 18:32:52.88	2026-01-12 18:32:52.88	\N	\N	\N	f
cmkbi4n76002r10vjo8qxj2av	MATERNITY	maternity	cmkbetj5k001f10vjjtj87v15	8	2026-01-12 18:33:54.546	2026-01-12 18:33:54.546	\N	\N	\N	f
cmkbi6r4i002s10vje5uqxwe5	Maternity Accessories	maternity-accessories	cmkbi4n76002r10vjo8qxj2av	1	2026-01-12 18:35:32.946	2026-01-12 18:35:32.946	\N	\N	\N	f
cmkbi7jf1002t10vjylcc6aif	Maternity Underwear	maternity-underwear	cmkbi4n76002r10vjo8qxj2av	2	2026-01-12 18:36:09.613	2026-01-12 18:36:09.613	\N	\N	\N	f
cmkbi839a002u10vjn0yxzdkv	 Maternity Trousers & Skirts	maternity-trousers-skirts	cmkbi4n76002r10vjo8qxj2av	3	2026-01-12 18:36:35.325	2026-01-12 18:36:35.325	\N	\N	\N	f
cmkbi8oy6002v10vj1p2smp0z	 Maternity Dresses	maternity-dresses	cmkbi4n76002r10vjo8qxj2av	4	2026-01-12 18:37:03.438	2026-01-12 18:37:03.438	\N	\N	\N	f
cmkbi9pg9002w10vj6wiudat7	 Maternity Tops & Jackets	maternity-tops-jackets	cmkbi4n76002r10vjo8qxj2av	5	2026-01-12 18:37:50.745	2026-01-12 18:37:50.745	\N	\N	\N	f
cmkbica9o002z10vjoy4ag7dr	Play Pens & Play Mats	play-pens-play-mats	cmkbiajx7002x10vjrcq3n548	2	2026-01-12 18:39:51.036	2026-01-12 18:39:51.036	\N	\N	\N	f
cmkbidiap003010vjt1te7tmf	Play Pens & Play Mats	play-pens-play-mats-2	cmkbiajx7002x10vjrcq3n548	2	2026-01-12 18:40:48.097	2026-01-12 18:40:48.097	\N	\N	\N	f
cmkbidy2r003110vjgq6ucae5	 Games & Puzzles	games-puzzles	cmkbiajx7002x10vjrcq3n548	3	2026-01-12 18:41:08.547	2026-01-12 18:41:08.547	\N	\N	\N	f
cmkbifrkx003310vjzgqxnd7f	Bicycles & Ride On	bicycles-ride-on	cmkbiajx7002x10vjrcq3n548	5	2026-01-12 18:42:33.441	2026-01-12 18:42:33.441	\N	\N	\N	f
cmkbig7mp003410vj14zcfdtw	New	new	cmkbiajx7002x10vjrcq3n548	6	2026-01-12 18:42:54.241	2026-01-12 18:42:54.241	\N	\N	\N	f
cmkbijd7m003810vjh4zf5h52	 Tablets for Kids	tablets-for-kids	cmkbiajx7002x10vjrcq3n548	10	2026-01-12 18:45:21.442	2026-01-12 18:45:21.442	\N	\N	\N	f
cmkbiajx7002x10vjrcq3n548	TOYS & ACTIVITIES	toys-activities	cmkbetj5k001f10vjjtj87v15	9	2026-01-12 18:38:30.235	2026-01-12 18:38:30.235	\N	\N	\N	f
cmkbibb5i002y10vjgrfprd0i	Party Store	party-store	cmkbiajx7002x10vjrcq3n548	1	2026-01-12 18:39:05.526	2026-01-12 18:39:05.526	\N	\N	\N	f
cmkbif4q8003210vjfltslt2a	Bouncers, Rockers & Swingers	bouncers-rockers-swingers	cmkbiajx7002x10vjrcq3n548	4	2026-01-12 18:42:03.824	2026-01-12 18:42:03.824	\N	\N	\N	f
cmkbihl9g003510vjbqqz3l0a	Hot	hot	cmkbiajx7002x10vjrcq3n548	7	2026-01-12 18:43:58.564	2026-01-12 18:43:58.564	\N	\N	\N	f
cmkbii6a7003610vjirxk1wyl	Activities	activities	cmkbiajx7002x10vjrcq3n548	8	2026-01-12 18:44:25.807	2026-01-12 18:44:25.807	\N	\N	\N	f
cmkbiim5a003710vj1uy2lj19	Educational Toys	educational-toys	cmkbiajx7002x10vjrcq3n548	9	2026-01-12 18:44:46.366	2026-01-12 18:44:46.366	\N	\N	\N	f
cmkbpyzfr003910vjd3h0ytzl	 CAR ELECTRONICS & ACCESSORIES	car-electronics-accessories	cmjdls81p0006vwvjd41gjm81	1	2026-01-12 22:13:27.398	2026-01-12 22:13:27.398	\N	\N	\N	f
cmkbq0vkl003a10vjjbhf4dax	Car Electronics	car-electronics	cmkbpyzfr003910vjd3h0ytzl	1	2026-01-12 22:14:55.701	2026-01-12 22:14:55.701	\N	\N	\N	f
cmkbq1cis003b10vjtt8jq6xw	Car Accessories	car-accessories	cmkbpyzfr003910vjd3h0ytzl	2	2026-01-12 22:15:17.668	2026-01-12 22:15:17.668	\N	\N	\N	f
cmkbq1wqn003c10vjkhcujm00	Power & Battery	power-battery	cmkbpyzfr003910vjd3h0ytzl	3	2026-01-12 22:15:43.87	2026-01-12 22:15:43.87	\N	\N	\N	f
cmkbq2ro8003d10vjq68fgjps	 CAR CARE	car-care	cmjdls81p0006vwvjd41gjm81	2	2026-01-12 22:16:23.96	2026-01-12 22:16:23.96	\N	\N	\N	f
cmkbq3d87003e10vjtfw79ld6	Interior Care	interior-care	cmkbq2ro8003d10vjq68fgjps	1	2026-01-12 22:16:51.895	2026-01-12 22:16:51.895	\N	\N	\N	f
cmkbq3xqn003f10vjic29xyyi	 Exterior Care	exterior-care	cmkbq2ro8003d10vjq68fgjps	2	2026-01-12 22:17:18.479	2026-01-12 22:17:18.479	\N	\N	\N	f
cmkbq4ik0003g10vjtjpdu8ou	 Cleaning Kits	cleaning-kits	cmkbq2ro8003d10vjq68fgjps	3	2026-01-12 22:17:45.456	2026-01-12 22:17:45.456	\N	\N	\N	f
cmkbq58pg003h10vjkllx07hr	OILS & FLUIDS	oils-fluids	cmjdls81p0006vwvjd41gjm81	3	2026-01-12 22:18:19.348	2026-01-12 22:18:19.348	\N	\N	\N	f
cmkbq5yob003i10vjd95z594o	 Greases & Lubricants Oils	greases-lubricants-oils	cmkbq58pg003h10vjkllx07hr	1	2026-01-12 22:18:53.003	2026-01-12 22:18:53.003	\N	\N	\N	f
cmkbq6jcf003j10vj0aes2gzj	Brake Fluids	brake-fluids	cmkbq58pg003h10vjkllx07hr	2	2026-01-12 22:19:19.79	2026-01-12 22:19:19.79	\N	\N	\N	f
cmkbq8m4g003k10vjknp36zml	TYRE & RIMS	tyre-rims	cmjdls81p0006vwvjd41gjm81	4	2026-01-12 22:20:56.704	2026-01-12 22:20:56.704	\N	\N	\N	f
cmkbq9bx4003l10vj54m0vkar	Tyre	tyre	cmkbq8m4g003k10vjknp36zml	1	2026-01-12 22:21:30.136	2026-01-12 22:21:30.136	\N	\N	\N	f
cmkbq9xlk003m10vj75yuv7cc	 Inflator & Guages	inflator-guages	cmkbq8m4g003k10vjknp36zml	2	2026-01-12 22:21:58.232	2026-01-12 22:21:58.232	\N	\N	\N	f
cmkbqauh4003n10vj8urr7h1l	 LIGHTS & LIGHTNING ACCESSORIES	lights-lightning-accessories	cmjdls81p0006vwvjd41gjm81	5	2026-01-12 22:22:40.84	2026-01-12 22:22:40.84	\N	\N	\N	f
cmkbqbmoi003o10vjm0652emc	Bulbs	bulbs	cmkbqauh4003n10vj8urr7h1l	1	2026-01-12 22:23:17.394	2026-01-12 22:23:17.394	\N	\N	\N	f
cmkbqceyu003p10vj9cgqsezw	 Accent & Off Road Lighting	accent-off-road-lighting	cmkbqauh4003n10vj8urr7h1l	2	2026-01-12 22:23:54.054	2026-01-12 22:23:54.054	\N	\N	\N	f
cmkbqd09f003q10vjo7pzcqnt	Brake Fluids	brake-fluids-2	cmkbqauh4003n10vj8urr7h1l	3	2026-01-12 22:24:21.651	2026-01-12 22:24:21.651	\N	\N	\N	f
cmkbqecsf003r10vjw4bm5nij	EXTERIOR ACCESSORIES	exterior-accessories	cmjdls81p0006vwvjd41gjm81	6	2026-01-12 22:25:24.543	2026-01-12 22:25:24.543	\N	\N	\N	f
cmkbqf2rx003s10vje97hek98	Mirrors	mirrors	cmkbqecsf003r10vjw4bm5nij	1	2026-01-12 22:25:58.22	2026-01-12 22:25:58.22	\N	\N	\N	f
cmkbqfh2q003t10vjbcwz54zk	 Covers	covers	cmkbqecsf003r10vjw4bm5nij	2	2026-01-12 22:26:16.754	2026-01-12 22:26:16.754	\N	\N	\N	f
cmkbqga58003u10vj260erb5f	Bumper Stickers, Decals & Magnets	bumper-stickers-decals-magnets	cmkbqecsf003r10vjw4bm5nij	3	2026-01-12 22:26:54.428	2026-01-12 22:26:54.428	\N	\N	\N	f
cmkbqgy9x003v10vjijdw8rx8	 INTERIOR ACCESSORIES	interior-accessories	cmjdls81p0006vwvjd41gjm81	7	2026-01-12 22:27:25.701	2026-01-12 22:27:25.701	\N	\N	\N	f
cmkbqih06003w10vj4yxmfcz6	Air Freshners	air-freshners	cmkbqgy9x003v10vjijdw8rx8	1	2026-01-12 22:28:36.63	2026-01-12 22:28:36.63	\N	\N	\N	f
cmkbqjqeo003x10vjmcrwdb1q	Seat Covers & Accessories	seat-covers-accessories	cmkbqgy9x003v10vjijdw8rx8	2	2026-01-12 22:29:35.472	2026-01-12 22:29:35.472	\N	\N	\N	f
cmkbql5cd003y10vjnczggzbg	Sun Protection	sun-protection	cmkbqgy9x003v10vjijdw8rx8	3	2026-01-12 22:30:41.485	2026-01-12 22:30:41.485	\N	\N	\N	f
cmkbqme0n003z10vjty7tdmw8	Floor Mats & Cargo Liners	floor-mats-cargo-liners	cmkbqgy9x003v10vjijdw8rx8	4	2026-01-12 22:31:39.383	2026-01-12 22:31:39.383	\N	\N	\N	f
cmkbqogjc004010vjtamq65ls	Key Chains	key-chains	cmkbqgy9x003v10vjijdw8rx8	5	2026-01-12 22:33:15.96	2026-01-12 22:33:15.96	\N	\N	\N	f
cmkbqpa1p004110vj9t5mkcsy	Consoles & Organizers	consoles-organizers	cmkbqgy9x003v10vjijdw8rx8	6	2026-01-12 22:33:54.205	2026-01-12 22:33:54.205	\N	\N	\N	f
cmkbs3a890000rcvj5ybn6emn	Mascara	mascara	cmjg9iyzd00077wvjamofgngr	1	2026-01-12 23:12:47.24	2026-01-12 23:12:47.24	\N	\N	\N	f
cmkbs3wly0001rcvjgmq187b4	Eye Shadow	eye-shadow	cmjg9iyzd00077wvjamofgngr	2	2026-01-12 23:13:16.246	2026-01-12 23:13:16.246	\N	\N	\N	f
cmkbs4jx00002rcvjgcidphhy	Foundation	foundation	cmjg9iyzd00077wvjamofgngr	3	2026-01-12 23:13:46.451	2026-01-12 23:13:46.451	\N	\N	\N	f
cmkbs58zg0003rcvjrf70xdha	 Lip Gloss	lip-gloss	cmjg9iyzd00077wvjamofgngr	4	2026-01-12 23:14:18.94	2026-01-12 23:14:18.94	\N	\N	\N	f
cmkbs5ruk0004rcvj4e472rr4	Eyeliner & Kajal	eyeliner-kajal	cmjg9iyzd00077wvjamofgngr	5	2026-01-12 23:14:43.388	2026-01-12 23:14:43.388	\N	\N	\N	f
cmkbs6ar30005rcvjd6h2jrw4	Lip Liner	lip-liner	cmjg9iyzd00077wvjamofgngr	6	2026-01-12 23:15:07.887	2026-01-12 23:15:07.887	\N	\N	\N	f
cmkbs6p5s0006rcvjk7b93dj9	Concealers & Color Correctors	concealers-color-correctors	cmjg9iyzd00077wvjamofgngr	7	2026-01-12 23:15:26.56	2026-01-12 23:15:26.56	\N	\N	\N	f
cmkbs7la20007rcvjak752em5	FRAGRANCES	fragrances	cmjdlsw9t0007vwvjjgm43ay7	4	2026-01-12 23:16:08.186	2026-01-12 23:16:08.186	\N	\N	\N	f
cmkbs8c6n0008rcvj6rubb2l0	 Women's Fragrance	womens-fragrance	cmkbs7la20007rcvjak752em5	1	2026-01-12 23:16:43.055	2026-01-12 23:16:43.055	\N	\N	\N	f
cmkbsb1et0009rcvj4be66zn4	Men's Fragrance	mens-fragrance	cmkbs7la20007rcvjak752em5	2	2026-01-12 23:18:49.061	2026-01-12 23:18:49.061	\N	\N	\N	f
cmkbsc4uo000arcvjf2by5w7b	HAIR CARE	hair-care	cmjdlsw9t0007vwvjjgm43ay7	5	2026-01-12 23:19:40.176	2026-01-12 23:19:40.176	\N	\N	\N	f
cmkbscpvk000brcvj485zvtbr	Hair Cutting Tools	hair-cutting-tools	cmkbsc4uo000arcvjf2by5w7b	1	2026-01-12 23:20:07.424	2026-01-12 23:20:07.424	\N	\N	\N	f
cmkbsdbeo000crcvjphff6ynp	 Shampoo & Conditioner	shampoo-conditioner	cmkbsc4uo000arcvjf2by5w7b	2	2026-01-12 23:20:35.328	2026-01-12 23:20:35.328	\N	\N	\N	f
cmkbsel1l000drcvj1j1rfw1e	Wigs & Accessories	wigs-accessories	cmkbsc4uo000arcvjf2by5w7b	3	2026-01-12 23:21:34.473	2026-01-12 23:21:34.473	\N	\N	\N	f
cmkbsfhv9000ercvj6mjdr004	Hair Accessories	hair-accessories	cmkbsc4uo000arcvjf2by5w7b	4	2026-01-12 23:22:17.013	2026-01-12 23:22:17.013	\N	\N	\N	f
cmkbsg1n1000frcvj7bsr84p2	Hair & Scalp Care	hair-scalp-care	cmkbsc4uo000arcvjf2by5w7b	5	2026-01-12 23:22:42.637	2026-01-12 23:22:42.637	\N	\N	\N	f
cmkbshhzb000grcvji7e3s9ey	PERSONAL CARE	personal-care	cmjdlsw9t0007vwvjjgm43ay7	6	2026-01-12 23:23:50.471	2026-01-12 23:23:50.471	\N	\N	\N	f
cmkbsiggf000hrcvjb44zsr2s	Contraceptives & Lubricants	contraceptives-lubricants	cmkbshhzb000grcvji7e3s9ey	1	2026-01-12 23:24:35.151	2026-01-12 23:24:35.151	\N	\N	\N	f
cmkbsj4du000ircvju8nqxvih	Sexual wellness	sexual-wellness	cmkbshhzb000grcvji7e3s9ey	2	2026-01-12 23:25:06.162	2026-01-12 23:25:06.162	\N	\N	\N	f
cmkbsjy6v000jrcvjrgtripex	Feminine Care	feminine-care	cmkbshhzb000grcvji7e3s9ey	3	2026-01-12 23:25:44.791	2026-01-12 23:25:44.791	\N	\N	\N	f
cmkbtdecw000krcvjdhiw0i2f	Supplements	supplements	cmjg9jnjm00087wvjsy7eb2nm	1	2026-01-12 23:48:38.766	2026-01-12 23:48:38.766	\N	\N	\N	f
cmkbte4n1000lrcvj0ncnayxz	Lab, Safety & Work Gloves	lab-safety-work-gloves	cmjg9jnjm00087wvjsy7eb2nm	2	2026-01-12 23:49:12.828	2026-01-12 23:49:12.828	\N	\N	\N	f
cmkbtewkn000mrcvjigdgb46e	Thermometers	thermometers	cmjg9jnjm00087wvjsy7eb2nm	3	2026-01-12 23:49:49.031	2026-01-12 23:49:49.031	\N	\N	\N	f
cmkbtfjcr000nrcvjuy3t1aeb	Hand Sanitizers	hand-sanitizers	cmjg9jnjm00087wvjsy7eb2nm	4	2026-01-12 23:50:18.555	2026-01-12 23:50:18.555	\N	\N	\N	f
cmkbtg5gf000orcvjzw9oh774	 Face Protection	face-protection	cmjg9jnjm00087wvjsy7eb2nm	5	2026-01-12 23:50:47.199	2026-01-12 23:50:47.199	\N	\N	\N	f
cmkctt3af0000ncvj0g5bwxe6	Literature	literature	cmjdltoi30008vwvj621x2w9c	4	2026-01-13 16:48:37.095	2026-01-13 16:48:37.095	\N	\N	\N	f
cmkcu88nj0001ncvj08dj3fru	SPORT AND FITNESS	sport-and-fitness	cmjdlu8w20009vwvjut0m9zdg	1	2026-01-13 17:00:23.887	2026-01-13 17:00:23.887	\N	\N	\N	f
cmkcu96hs0002ncvjpwaxp4mo	Fitness	fitness	cmkcu88nj0001ncvj08dj3fru	1	2026-01-13 17:01:07.744	2026-01-13 17:01:07.744	\N	\N	\N	f
cmkcu9p9h0003ncvjk71ke1nu	Sportswear	sportswear	cmkcu88nj0001ncvj08dj3fru	2	2026-01-13 17:01:32.069	2026-01-13 17:01:32.069	\N	\N	\N	f
cmkcuasng0004ncvjcrt2csqp	 Football	football	cmkcu88nj0001ncvj08dj3fru	3	2026-01-13 17:02:23.116	2026-01-13 17:02:23.116	\N	\N	\N	f
cmkcubzn30006ncvjo69t2xm2	Boxing	boxing	cmkcu88nj0001ncvj08dj3fru	5	2026-01-13 17:03:18.831	2026-01-13 17:03:18.831	\N	\N	\N	f
cmkcuczem0007ncvjnre0hv40	 Basketball	basketball	cmkcu88nj0001ncvj08dj3fru	6	2026-01-13 17:04:05.182	2026-01-13 17:04:05.182	\N	\N	\N	f
cmkcudxio0008ncvjmd8fpluz	Outdoor & Indoor Games	outdoor-indoor-games	cmkcu88nj0001ncvj08dj3fru	7	2026-01-13 17:04:49.392	2026-01-13 17:04:49.392	\N	\N	\N	f
cmkcufb000009ncvjhwa0ge01	 BUILDING & INDUSTRIAL MATERIALS	building-industrial-materials	cmjdlu8w20009vwvjut0m9zdg	2	2026-01-13 17:05:53.52	2026-01-13 17:05:53.52	\N	\N	\N	f
cmkcugbpl000ancvjv2n3w8aa	Electrical Fittings	electrical-fittings	cmkcufb000009ncvjhwa0ge01	1	2026-01-13 17:06:41.097	2026-01-13 17:06:41.097	\N	\N	\N	f
cmkcuh6xy000bncvjc7r8uuaw	Paints	paints	cmkcufb000009ncvjhwa0ge01	2	2026-01-13 17:07:21.574	2026-01-13 17:07:21.574	\N	\N	\N	f
cmkcuhnau000cncvjwtzw36zy	Construction Materials	construction-materials	cmkcufb000009ncvjhwa0ge01	3	2026-01-13 17:07:42.773	2026-01-13 17:07:42.773	\N	\N	\N	f
cmkcuign9000dncvje4hbi9sm	Construction Materials	construction-materials-2	cmkcufb000009ncvjhwa0ge01	3	2026-01-13 17:08:20.805	2026-01-13 17:08:20.805	\N	\N	\N	f
cmkculf0c000encvjo2o6at8m	Plumbing Materials	plumbing-materials	cmkcufb000009ncvjhwa0ge01	4	2026-01-13 17:10:38.651	2026-01-13 17:10:38.651	\N	\N	\N	f
cmkculwfo000fncvjdc9rn4jh	Sewing Machines & Accessories	sewing-machines-accessories	cmkcufb000009ncvjhwa0ge01	5	2026-01-13 17:11:01.235	2026-01-13 17:11:01.235	\N	\N	\N	f
cmkcumtb0000gncvj2hpq3uvk	MUSICAL EQUIPMENTS	musical-equipments	cmjdlu8w20009vwvjut0m9zdg	3	2026-01-13 17:11:43.836	2026-01-13 17:11:43.836	\N	\N	\N	f
cmkcungaz000hncvjrhtjvyyw	Keyboard, Pianos & Drums	keyboard-pianos-drums	cmkcumtb0000gncvj2hpq3uvk	1	2026-01-13 17:12:13.642	2026-01-13 17:12:13.642	\N	\N	\N	f
cmkcunzmr000incvjeyc351i1	Wind Instruments	wind-instruments	cmkcumtb0000gncvj2hpq3uvk	2	2026-01-13 17:12:38.691	2026-01-13 17:12:38.691	\N	\N	\N	f
cmkcuoqbq000jncvjvgpswlx3	String Instruments	string-instruments	cmkcumtb0000gncvj2hpq3uvk	3	2026-01-13 17:13:13.286	2026-01-13 17:13:13.286	\N	\N	\N	f
cmkcupkgz000kncvjdp2crvcx	Wind Instruments	wind-instruments-2	cmkcumtb0000gncvj2hpq3uvk	4	2026-01-13 17:13:52.355	2026-01-13 17:13:52.355	\N	\N	\N	f
cmkcuqqtz000lncvjbuiesqff	 AUTOMOTIVE	automotive	cmjdlu8w20009vwvjut0m9zdg	4	2026-01-13 17:14:47.255	2026-01-13 17:14:47.255	\N	\N	\N	f
cmkcus0x2000mncvj0u88cp23	Tyres & Batteries	tyres-batteries	cmkcuqqtz000lncvjbuiesqff	1	2026-01-13 17:15:46.981	2026-01-13 17:15:46.981	\N	\N	\N	f
cmkcusnon000nncvj6ns3gfiv	Replacement Parts	replacement-parts	cmkcuqqtz000lncvjbuiesqff	2	2026-01-13 17:16:16.487	2026-01-13 17:16:16.487	\N	\N	\N	f
cmkcut7vx000oncvj4u2nvhtu	 Hand & Power Tools	hand-power-tools	cmkcuqqtz000lncvjbuiesqff	3	2026-01-13 17:16:42.669	2026-01-13 17:16:42.669	\N	\N	\N	f
cmkcuu39s000pncvjoytio2dw	 Autocare & Maintenance	autocare-maintenance	cmkcuqqtz000lncvjbuiesqff	4	2026-01-13 17:17:23.344	2026-01-13 17:17:23.344	\N	\N	\N	f
cmkcuuuoz000qncvjtwp3n6ly	Safety and Security	safety-and-security	cmkcuqqtz000lncvjbuiesqff	5	2026-01-13 17:17:58.882	2026-01-13 17:17:58.882	\N	\N	\N	f
cmkcuwdb9000rncvjgd8vn1e4	Automotive Tools & Accessories	automotive-tools-accessories	cmkcuqqtz000lncvjbuiesqff	6	2026-01-13 17:19:09.669	2026-01-13 17:19:09.669	\N	\N	\N	f
cmkcux3a3000sncvj93gasg33	ALCOHOLIC & BEVERAGES	alcoholic-beverages	cmjdlu8w20009vwvjut0m9zdg	4	2026-01-13 17:19:43.323	2026-01-13 17:19:43.323	\N	\N	\N	f
cmkcuxukv000tncvjgyei8crc	Wines	wines	cmkcux3a3000sncvj93gasg33	1	2026-01-13 17:20:18.703	2026-01-13 17:20:18.703	\N	\N	\N	f
cmkcuy7vt000uncvj4dvkrzfr	Liqueurs & Creams	liqueurs-creams	cmkcux3a3000sncvj93gasg33	2	2026-01-13 17:20:35.945	2026-01-13 17:20:35.945	\N	\N	\N	f
cmkcuzctz000vncvjvhe3hra6	Whiskey	whiskey	cmkcux3a3000sncvj93gasg33	3	2026-01-13 17:21:29.015	2026-01-13 17:21:29.015	\N	\N	\N	f
cmkcv00ly000wncvj6crno5bz	Champagne	champagne	cmkcux3a3000sncvj93gasg33	4	2026-01-13 17:21:59.83	2026-01-13 17:21:59.83	\N	\N	\N	f
cmkcv2033000xncvjktrumtbz	OFFICE PRODUCTS	office-products	cmjdlu8w20009vwvjut0m9zdg	6	2026-01-13 17:23:32.463	2026-01-13 17:23:32.463	\N	\N	\N	f
cmkcv32yw000yncvjxkz1ch8w	Office & School Supplies	office-school-supplies	cmkcv2033000xncvjktrumtbz	1	2026-01-13 17:24:22.855	2026-01-13 17:24:22.855	\N	\N	\N	f
cmkcv3jdh000zncvjhy2biq0w	Office Furniture & Lighting	office-furniture-lighting	cmkcv2033000xncvjktrumtbz	2	2026-01-13 17:24:44.117	2026-01-13 17:24:44.117	\N	\N	\N	f
cmkcv47d20010ncvjai6qh2q3	Packaging Materials	packaging-materials	cmkcv2033000xncvjktrumtbz	3	2026-01-13 17:25:15.206	2026-01-13 17:25:15.206	\N	\N	\N	f
cmkcv4v8s0011ncvj8rqlvd80	Stationery	stationery	cmkcv2033000xncvjktrumtbz	4	2026-01-13 17:25:46.156	2026-01-13 17:25:46.156	\N	\N	\N	f
cmkcv5p0f0012ncvj37kg1r8p	GENERATOR & POWER SOLUTIONS	generator-power-solutions	cmjdlu8w20009vwvjut0m9zdg	7	2026-01-13 17:26:24.734	2026-01-13 17:26:24.734	\N	\N	\N	f
cmkcv62r80013ncvj4z9lz1xb	 UPS & Surge Protectors	ups-surge-protectors	cmkcv5p0f0012ncvj37kg1r8p	1	2026-01-13 17:26:42.548	2026-01-13 17:26:42.548	\N	\N	\N	f
cmkcv6i170014ncvjwkh1j28c	Generators & Accessories	generators-accessories	cmkcv5p0f0012ncvj37kg1r8p	2	2026-01-13 17:27:02.347	2026-01-13 17:27:02.347	\N	\N	\N	f
cmkcv716m0015ncvjpumhk5i1	Inverters	inverters	cmkcv5p0f0012ncvj37kg1r8p	3	2026-01-13 17:27:27.166	2026-01-13 17:27:27.166	\N	\N	\N	f
cmkcv7pho0016ncvj9jj1zayj	Safety and Security	safety-and-security-2	cmkcv5p0f0012ncvj37kg1r8p	4	2026-01-13 17:27:58.668	2026-01-13 17:27:58.668	\N	\N	\N	f
cmk8b587n0000m0vjyvlglzw4	MarvelMarts Fashion	marvelmarts-fashion	\N	4	2026-01-10 12:55:05.939	2026-03-27 17:10:23.107	https://res.cloudinary.com/dq0vynxci/image/upload/v1774631402/gndqrxs273hdx6i7xpew.png	\N	\N	t
cmk4o1bnr0001qwvjvfhh6zvm	Laptops	laptops	cmk4o07ls0000qwvj5ft7s0bi	1	2026-01-07 23:44:54.087	2026-03-27 17:11:24.613	https://res.cloudinary.com/dq0vynxci/image/upload/v1774630849/p8wy0ytdwcnjxvt8kl8d.png	\N	\N	t
cmkba94sa000010vjoyg1xkxm	Home and Kitchens	home-and-kitchens	\N	5	2026-01-12 14:53:27.034	2026-03-27 17:13:29.476	https://res.cloudinary.com/dq0vynxci/image/upload/v1774631580/zy3bm38ra8hf2k5nnmt0.jpg	\N	\N	t
cmk77ai990000scvj00m4ee13	Electronics	electronics	\N	3	2026-01-09 18:19:27.596	2026-03-27 17:18:36.325	https://res.cloudinary.com/dq0vynxci/image/upload/v1774631912/guzvcib8ucnfwesv2f3m.jpg	\N	\N	t
cmk4o07ls0000qwvj5ft7s0bi	Computers and Accessories	computers-and-accessories	\N	1	2026-01-07 23:44:02.169	2026-03-27 17:21:34.25	https://res.cloudinary.com/dq0vynxci/image/upload/v1774630925/fnyw9udkzyokr43honbx.png	\N	\N	t
\.


--
-- Data for Name: Conversation; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Conversation" (id, "createdAt", "updatedAt", "participantIds", type, subject) FROM stdin;
cmn9jwo1d000004ld9ittff31	2026-03-27 23:47:16.267	2026-03-27 23:47:16.267	{cmn8aydn2000104l7f3b1ul9s,cmn7vk7v800018svja1fktsv9}	CUSTOMER_VENDOR	Inquiry: Samsung Galaxy Z Flip6 12GB RAM + 512GB
\.


--
-- Data for Name: Coupon; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Coupon" (id, code, "discountValue", "isPercentage", "limit", "usedCount", "expiryDate", "isActive", "createdAt") FROM stdin;
\.


--
-- Data for Name: CreditTransaction; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."CreditTransaction" (id, reference, amount, platform, status, "vendorProfileId", "createdAt", "emailSent", "emailSentAt") FROM stdin;
\.


--
-- Data for Name: CustomerProfile; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."CustomerProfile" (id, "userId", phone, address, "createdAt", "updatedAt") FROM stdin;
cmn8aydna000204l7c8vygi5e	cmn8aydn2000104l7f3b1ul9s	\N	\N	2026-03-27 02:48:53.39	2026-03-27 02:48:53.39
cmndrlzba000204l7onfoskac	cmndrlzb4000104l7l1mv458w	\N	\N	2026-03-30 22:33:59.295	2026-03-30 22:33:59.295
\.


--
-- Data for Name: Dispute; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Dispute" (id, "vendorProfileId", reason, status, "createdAt", "orderId", description, "raisedById") FROM stdin;
\.


--
-- Data for Name: EmailVerification; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."EmailVerification" (id, email, code, verified, "expiresAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: FlashSale; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."FlashSale" (id, name, "startTime", "endTime", discount, "isActive") FROM stdin;
\.


--
-- Data for Name: HelpArticle; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."HelpArticle" (id, slug, title, excerpt, content, keywords, category, "createdAt", "updatedAt", helpful, "notHelpful") FROM stdin;
\.


--
-- Data for Name: Message; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Message" (id, "conversationId", "senderId", "senderName", content, "isRead", "createdAt", "productId", "productImage", "productPrice") FROM stdin;
\.


--
-- Data for Name: NewsletterSubscriber; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."NewsletterSubscriber" (id, email, "createdAt") FROM stdin;
cmncc5j2v000004l73lhpbshp	RDUFFY55@YAHOO.COM	2026-03-29 22:33:31.141
cmncdbke0000004lbt7ofw2x3	export@hallmark.com	2026-03-29 23:06:12.577
cmncfgbjb000004jui0og3nt9	bkk807@gmail.com	2026-03-30 00:05:53.524
cmncft7fh000104juo025vh4e	eherrmann@velasoftwaregroup.com	2026-03-30 00:15:54.804
cmncg4rxn000004jsw0cm1ljz	fiman@velasoftwaregroup.com	2026-03-30 00:24:54.512
cmncgm2z3000004jvol298mel	fuentes@zenbusiness.com	2026-03-30 00:38:21.973
cmnchc780000004l8d0k5y2a5	sales@hallmarkplus.com	2026-03-30 00:58:40.456
cmnci59wp000004l2hk0dirr5	cpizzuti@velasoftwaregroup.com	2026-03-30 01:21:17.001
cmncj1ivh000004ikaj2yy41x	dlee@velasoftwaregroup.com	2026-03-30 01:46:21.65
cmnck22oc000004jjawtn121v	marc.doering@zenbusiness.com	2026-03-30 02:14:46.945
cmncktq6g000004jov6obm4ss	marks@zenbusiness.com	2026-03-30 02:36:17.119
cmncm2682000004lbzmp0umh5	sknight@velasoftwaregroup.com	2026-03-30 03:10:50.779
cmncn9udf000004lauh3earqq	sbates@velasoftwaregroup.com	2026-03-30 03:44:48.186
cmncnsatc000004l42y6uzhxv	cklaasen@velasoftwaregroup.com	2026-03-30 03:59:09.398
cmncq64oj000004iei6uw7bof	jmingail@velasoftwaregroup.com	2026-03-30 05:05:53.848
cmnct7673000004i3544zhhcn	info@pro2col.com	2026-03-30 06:30:41.318
cmnctxsy8000004jxaf8bcp02	info@roborana.be	2026-03-30 06:51:23.876
cmncu003g000104jxqmgrb7ni	contact@sygnia.co	2026-03-30 06:53:06.527
cmncustl0000004l843jjbj84	tnguyen@velasoftwaregroup.com	2026-03-30 07:15:31.043
cmncv4nwt000004l497t8hnla	marcy.yarborough@zenbusiness.com	2026-03-30 07:24:43.572
cmncv999g000004js8wiaep01	marcela.shine@zenbusiness.com	2026-03-30 07:28:17.844
cmncx1mg8000004l5nzmkj46e	dtavares@velasoftwaregroup.com	2026-03-30 08:18:20.889
cmnd15lfd000004l8br8oosnu	dmckay@velasoftwaregroup.com	2026-03-30 10:13:24.68
cmnd2wuwc000004i5149nso6i	poohbearlu1@aol.com	2026-03-30 11:02:36.241
cmnd4kprm000004jjbqaridxk	aesthelec@yahoo.com	2026-03-30 11:49:08.994
cmnd5cl6o000004l1rxmqp3sm	info@pisowotzki.de	2026-03-30 12:10:49.438
cmnd5qg1t000004l4rta4hbxz	GDPR@hallmark.com	2026-03-30 12:21:35.965
cmnd68sc9000004jr53e1j22y	teenuhh13@gmail.com	2026-03-30 12:35:51.715
cmnd8174p000004ji7cux0l60	br1558@bellsouth.net	2026-03-30 13:25:56.852
cmnd8zcy7000004l1qgzqv45o	dpo@avanquest.com	2026-03-30 13:52:30.678
cmndbbgli000004ie3qxg1x8k	Hungryfarmerbbq@gmail.com	2026-03-30 14:57:54.57
cmndblqbm000004lad9d5swpj	djwfeld@gmail.com	2026-03-30 15:05:53.691
cmndbqno4000104laefggddcd	jbillowits@velasoftwaregroup.com	2026-03-30 15:09:43.603
cmndc1csz000004l4bay8y50p	avirani@velasoftwaregroup.com	2026-03-30 15:18:02.674
cmnddj8e9000004ldlfsx0ky5	shymon@msn.com	2026-03-30 15:59:56.256
cmnderskw000004kwbcugfel5	c24tru@gmail.com	2026-03-30 16:34:35.401
cmndinprx000004k3wb8hnhv7	varrelc@hotmail.com	2026-03-30 18:23:23.59
cmndjkdaf000004l5skxab2he	sparks3433@outlook.com	2026-03-30 18:48:47.165
cmndklreu000004jpcutayo01	stw298s@hotmail.com	2026-03-30 19:17:51.641
cmndnc8gm000004l1yt1mmpe5	expo321123@gmail.com	2026-03-30 20:34:25.96
cmndnmfre000004ic0fj1s0id	mrpink94109@gmail.com	2026-03-30 20:42:22.028
cmndonk27000004jlzx3lxr4j	cbarilas@cltel.net	2026-03-30 21:11:13.857
cmndosjiv000104jlfh8g9sn8	margarettripp23@hotmail.com	2026-03-30 21:15:06.557
cmndr9cac000204ji94s8zm1n	kswwmprice@gmail.com	2026-03-30 22:24:09.556
cmndspzyt000004js9rq1uh2c	jroman130@gmail.com	2026-03-30 23:05:06.363
cmndt64ku000004ies9x6fxjr	premiumcourse365@gmail.com	2026-03-30 23:17:38.742
cmndt8jum000004kwn5zyy89q	jazmin@tahoedentist.com	2026-03-30 23:19:31.804
cmnffg0g5000004l1dw3iu729	support@coursestodownload.com	2026-04-01 02:28:57.701
cmnfi46xl000004la2qdw8grn	amandabynes@course24h.com	2026-04-01 03:43:45.063
cmnfiijmn000004lazq3grxn6	cathy@cathychris.com	2026-04-01 03:54:54.71
cmnfl6wy9000004l7sjuvip20	kyo1212ser@gmail.com	2026-04-01 05:09:50.88
cmnfo2vr9000004l2a4ecicvj	machavezsabio@gmail.com	2026-04-01 06:30:41.53
cmnfrkwmr000004gts31azdel	christasodders@gmail.com	2026-04-01 08:08:41.34
cmnfxwxe6000004l2svpstpe1	zpangelus@yahoo.com	2026-04-01 11:05:59.891
cmng2scev000004jpa7ng2dlf	CITSiZIMVD@yandex.ru	2026-04-01 13:22:24.15
cmng45e5b000004l2j4t63z22	RNWEAVER72@YAHOO.COM	2026-04-01 14:00:32.536
cmng4k44o000104l2kqgvzlpn	lwelling@maximcrane.com	2026-04-01 14:11:59.497
cmng6fpmx000004l5s586mug5	aaron.fox@handd.co.uk	2026-04-01 15:04:33.278
cmng7djlp000004jlh1mmnq8b	vanessa22saint@gmail.com	2026-04-01 15:30:51.791
cmng837wa000004ih7s999cwj	asianbite@yahoo.com	2026-04-01 15:50:49.737
cmng8i4gr000004i5s0bmdlgg	tamwaydzk@yahoo.com	2026-04-01 16:02:25.058
cmng9u9q3000004k1q3ssv3uj	Jasminekwon91@icloud.com	2026-04-01 16:39:51.352
cmngf4rt2000004l5ib6e6gff	sandralonso357@gmail.com	2026-04-01 19:07:59.209
cmnggetgl000004l4c0pyg6tr	vgrape@yahoo.com	2026-04-01 19:43:47.757
cmnghs91c000004l13zajh21u	Susanfranco@hotmail.com	2026-04-01 20:22:14.078
cmngjis5k000004l6xpmw0w3k	ayoung@my.campus.edu	2026-04-01 21:10:51.55
cmngql7ge000004l5ais6o1ex	allisonlindsaystevens@gmail.com	2026-04-02 00:28:41.925
cmngqyhua000004lbl2ck6zjq	alex165_mail@yahoo.com	2026-04-02 00:39:01.89
cmngr392q000004jyaa4onks0	alovxmas@gmail.com	2026-04-02 00:42:43.92
cmnh430o3000004jx2ncednw2	tandlshennact@aol.com	2026-04-02 06:46:27.947
cmnh4c5hc000104jxf4jcyq6h	Rippenz71@aol.com	2026-04-02 06:53:34.24
\.


--
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Notification" (id, "userId", type, title, message, link, "isRead", "createdAt") FROM stdin;
\.


--
-- Data for Name: Order; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Order" (id, "userId", status, subtotal, shipping, tax, total, "paymentIntentId", "createdAt", apartment, city, email, "firstName", "lastName", "orderNotes", "orderNumber", phone, "shippingAddress", "shippingCity", "shippingState", state, "streetAddress", "useDifferentShipping", "paymentStatus", "emailSent", "refundStatus", "trackingNumber", "refundReason", "refundReference", "cancelReason", "vendorProfileId", "shippingFirstName", "shippingLastName", "paymentTypes") FROM stdin;
cmn8b5xot000304l73wqk0u38	cmn8aydn2000104l7f3b1ul9s	DELIVERED	1835100.00	2500.00	0.00	1837600.00	1774580022096	2026-03-27 02:54:45.961	\N	Ifako Ijaye	tayomarvel@gmail.com	Olaoluwa	Samuel	\N	MARVEL-2026-853123	\N	29 Kolapo street, College road, ifako ijaye	Ifako Ijaye	Lagos	Lagos	29 Kolapo street, College road, ifako ijaye	f	t	f	\N	\N	\N	\N	\N	cmn803wni000a8svjstuwe25s	Olaoluwa	Samuel	\N
cmndfmcza000004jo1fabc4x5	\N	pending	360800.00	2500.00	0.00	363300.00	\N	2026-03-30 16:58:21.61	\N	Ifako Ijaye	marvelcreativemedia@gmail.com	Marvel	Tayo	\N	MARVEL-2026-176454	07048245026	29 Kolapo street, College road, ifako ijaye	Ifako Ijaye	Lagos	Lagos	29 Kolapo street, College road, ifako ijaye	f	f	f	\N	\N	\N	\N	\N	cmn803wni000a8svjstuwe25s	Marvel	Tayo	\N
cmndfzp62000004jv1cfqqn2p	\N	pending	360800.00	2500.00	0.00	363300.00	\N	2026-03-30 17:08:43.941	\N	Ifako Ijaye	marvelcreativemedia@gmail.com	Marvel	Tayo	\N	MARVEL-2026-374687	07048245026	29 Kolapo street, College road, ifako ijaye	Ifako Ijaye	Lagos	Lagos	29 Kolapo street, College road, ifako ijaye	f	f	f	\N	\N	\N	\N	\N	cmn803wni000a8svjstuwe25s	Marvel	Tayo	\N
cmndgrqvv000304i9c8hw27fs	\N	pending	45000.00	2500.00	0.00	47500.00	\N	2026-03-30 17:30:32.535	\N	Ikeja	marvelcreativemedia@gmail.com	Marvel	Tayo	\N	MARVEL-2026-762120	08186019049	29, kolapo Boluwade, college road	Ikeja	Lagos	Lagos	29, kolapo Boluwade, college road	f	f	f	\N	\N	\N	\N	\N	cmn803wni000a8svjstuwe25s	Marvel	Tayo	\N
cmndpc5am000fp8vjtl8de9xn	\N	pending	50000.00	2500.00	0.00	52500.00	\N	2026-03-30 21:30:21.03	\N	Ikeja	marvelcreativemedia@gmail.com	Marvel	Tayo	\N	MARVEL-2026-449788	08186019049	29, kolapo Boluwade, college road	Ikeja	Lagos	Lagos	29, kolapo Boluwade, college road	f	f	f	\N	\N	\N	\N	\N	cmn803wni000a8svjstuwe25s	Marvel	Tayo	\N
cmndql8w7000304l7dt4lqjvs	\N	pending	360800.00	2500.00	0.00	363300.00	\N	2026-03-30 22:05:25.444	\N	Ifako Ijaye	ajongs2007@gmail.com	Adetayo	Ezekiel	\N	MARVEL-2026-277229	07048245026	29 Kolapo street, College road, ifako ijaye	Ifako Ijaye	Lagos	Lagos	29 Kolapo street, College road, ifako ijaye	f	f	f	\N	\N	\N	\N	\N	cmn803wni000a8svjstuwe25s	Adetayo	Ezekiel	\N
cmndr0bls000004jio09cq05r	\N	pending	80000.00	2500.00	0.00	82500.00	\N	2026-03-30 22:17:08.796	\N	Ikeja	marvelcreativemedia@gmail.com	Marvel	Tayo	\N	MARVEL-2026-981934	08186019049	Iregun-Ijesha	Ikeja	Lagos	Lagos	Iregun-Ijesha	f	f	f	\N	\N	\N	\N	\N	cmn803wni000a8svjstuwe25s	Marvel	Tayo	\N
cmndrn4k0000004jolochxvds	cmndrlzb4000104l7l1mv458w	pending	80000.00	2500.00	0.00	82500.00	\N	2026-03-30 22:34:52.748	\N	Ikeja	marvelcreativemedia@gmail.com	Marvel	Tayo	\N	MARVEL-2026-411209	08186019049	29, kolapo Boluwade, college road	Ikeja	Lagos	Lagos	29, kolapo Boluwade, college road	f	f	f	\N	\N	\N	\N	\N	cmn803wni000a8svjstuwe25s	Marvel	Tayo	\N
\.


--
-- Data for Name: OrderItem; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."OrderItem" (id, "orderId", "productId", "variantId", qty, "unitPrice", "imageUrl", title) FROM stdin;
cmn8b5xr0000404l7wd4rbtol	cmn8b5xot000304l73wqk0u38	cmn81bhut000d8svj516y6f82	\N	1	1835100.00	https://res.cloudinary.com/dq0vynxci/image/upload/v1774563545/marvelmarts/products/fxqxlncczypmiuccykiy.png	Samsung Galaxy Z Flip6 12GB RAM + 512GB
cmndfmczo000104joj857hali	cmndfmcza000004jo1fabc4x5	cmn82qm7g000j8svj28kgqlzu	\N	1	360800.00	https://res.cloudinary.com/dq0vynxci/image/upload/v1774565928/marvelmarts/products/ka2c9ix8zjafzxuti2tl.png	OPPO A5 PRO 8 +256GB
cmndfzp6a000104jvagcngxtn	cmndfzp62000004jv1cfqqn2p	cmn82qm7g000j8svj28kgqlzu	\N	1	360800.00	https://res.cloudinary.com/dq0vynxci/image/upload/v1774565928/marvelmarts/products/ka2c9ix8zjafzxuti2tl.png	OPPO A5 PRO 8 +256GB
cmndgrqw5000404i9tiup4lgp	cmndgrqvv000304i9c8hw27fs	cmn84n6xn000r8svjm0i0qs6d	\N	1	45000.00	https://res.cloudinary.com/dq0vynxci/image/upload/v1774569131/marvelmarts/products/mw2jvg7l7pnwmejuy6rh.jpg	Plate Racks
cmndpc5hn000gp8vjjnml5jlb	cmndpc5am000fp8vjtl8de9xn	cmn84hpbo000p8svjpg8bpkmj	\N	1	50000.00	https://res.cloudinary.com/dq0vynxci/image/upload/v1774568876/marvelmarts/products/jwstholadepdtwz3e0x8.jpg	Silver Crest Commercial Blender
cmndql8wh000404l7cftlylsb	cmndql8w7000304l7dt4lqjvs	cmn82qm7g000j8svj28kgqlzu	\N	1	360800.00	https://res.cloudinary.com/dq0vynxci/image/upload/v1774565928/marvelmarts/products/ka2c9ix8zjafzxuti2tl.png	OPPO A5 PRO 8 +256GB
cmndr0bm2000104ji77xm16el	cmndr0bls000004jio09cq05r	cmn94xmsb000hlkvj4hc0qelt	\N	1	80000.00	https://res.cloudinary.com/dq0vynxci/image/upload/v1774630085/marvelmarts/products/nvjkb9pwnbbe6a2bhert.png	Air Frier
cmndrn4kc000104joi3j8k1w0	cmndrn4k0000004jolochxvds	cmn94xmsb000hlkvj4hc0qelt	\N	1	80000.00	https://res.cloudinary.com/dq0vynxci/image/upload/v1774630085/marvelmarts/products/nvjkb9pwnbbe6a2bhert.png	Air Frier
\.


--
-- Data for Name: PasswordResetToken; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PasswordResetToken" (id, "userId", token, "expiresAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: PaymentMethod; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PaymentMethod" (id, "userId", provider, "providerId", "cardType", last4, "expiryMonth", "expiryYear", "isDefault", metadata, "createdAt", "updatedAt") FROM stdin;
cmn8wwup90000nsvjtnw4kvny	cmn8aydn2000104l7f3b1ul9s	PAYSTACK	AUTH_hzy8x4sjb1	visa	4081	12	30	t	{"id": 5976207265, "log": {"input": [], "errors": 0, "mobile": false, "history": [{"time": 12, "type": "action", "message": "Attempted to pay with card"}, {"time": 12, "type": "success", "message": "Successfully paid with card"}], "success": true, "attempts": 1, "start_time": 1774616592, "time_spent": 12}, "fees": 75, "plan": null, "split": {}, "amount": 5000, "domain": "test", "paidAt": "2026-03-27T13:03:23.000Z", "source": null, "status": "success", "channel": "card", "connect": null, "message": null, "paid_at": "2026-03-27T13:03:23.000Z", "currency": "NGN", "customer": {"id": 338322636, "email": "tayomarvel@gmail.com", "phone": "", "metadata": null, "last_name": "", "first_name": "", "risk_action": "default", "customer_code": "CUS_tb30kcxygvyazlp", "international_format_phone": null}, "metadata": {"referrer": "http://localhost:3000/account/customer/payment-methods"}, "order_id": null, "createdAt": "2026-03-27T13:03:11.000Z", "reference": "T306520291632400", "created_at": "2026-03-27T13:03:11.000Z", "fees_split": null, "ip_address": "102.88.54.142", "subaccount": {}, "plan_object": {}, "authorization": {"bin": "408408", "bank": "TEST BANK", "brand": "visa", "last4": "4081", "channel": "card", "exp_year": "2030", "reusable": true, "card_type": "visa ", "exp_month": "12", "signature": "SIG_Fw4pOFNNFe0t6CavtHkm", "account_name": null, "country_code": "NG", "receiver_bank": null, "authorization_code": "AUTH_hzy8x4sjb1", "receiver_bank_account_number": null}, "fees_breakdown": null, "receipt_number": null, "gateway_response": "Successful", "requested_amount": 5000, "transaction_date": "2026-03-27T13:03:11.000Z", "pos_transaction_data": null}	2026-03-27 13:03:33.74	2026-03-27 13:03:33.74
\.


--
-- Data for Name: Payout; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Payout" (id, amount, status, "vendorId", "createdAt", "updatedAt", "accountName", "accountNumber", "bankName", "vendorProfileId", "adminRemarks", "processedAt", reference) FROM stdin;
cmn8bkw8j000004jsuxeko73q	1000000	APPROVED	cmn7vk7v800018svja1fktsv9	2026-03-27 03:06:23.923	2026-03-27 03:07:50.734	Tayo Bolarinwa	8186019049	OPay	cmn803wni000a8svjstuwe25s	Processed by Admin	2026-03-27 03:07:50.732	PAYOUT-1774580783918-20762
\.


--
-- Data for Name: Product; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Product" (id, title, slug, description, brand, price, "discountPrice", stock, rating, "ratingCount", "createdAt", "updatedAt", "categoryId", "isFeatured", "isPublished", "lowStockThreshold", "metaDescription", "metaTitle", status, sku, tags, "isFlashSale", "isNewArrival", "shippingMethod", weight, "isTrending", "salesCount", "vendorProfileId", "boostUntil") FROM stdin;
cmn82qm7g000j8svj28kgqlzu	OPPO A5 PRO 8 +256GB	oppo-a5-pro-8-256gb-1774565925989	<p><strong>Display &amp; Design</strong></p><ul><li><p><strong>Display</strong>:<br>6.67-inch IPS LCD with a resolution of 720 x 1604 pixels, 120Hz refresh<br>rate, and 1000 nits peak brightness</p></li><li><p><strong>Protection</strong>:<br>Corning Gorilla Glass 7i</p></li><li><p><strong>Design</strong>:<br>Slim profile at approximately 7.8mm thickness, weighing around 194g</p></li><li><p><strong>Colors</strong>:<br>Mocha Brown and Bloom Pink</p></li><li><p><strong>Durability</strong>:<br>IP68/IP69-rated for dust and water resistance, MIL-STD-810H certified for<br>military-grade durability</p></li></ul><p></p><p></p><p><strong>⚙️<br>Performance &amp; Storage</strong></p><ul><li><p><strong>Processor</strong>:<br>MediaTek Dimensity 6300 (6nm), Octa-core CPU</p></li><li><p><strong>GPU</strong>: Mali-G57<br>MC2</p></li><li><p><strong>RAM</strong>: 8GB<br>LPDDR4X</p></li><li><p><strong>Storage</strong>:<br>256GB UFS 2.2, expandable via microSDXC card</p></li><li><p><strong>Operating System</strong>:<br>Android 15 with ColorOS 15​</p></li></ul><p></p><p></p><p><strong>📸 Camera System</strong></p><ul><li><p><strong>Rear Cameras</strong>:</p><ul><li><p>50MP Main Camera (f/1.8 aperture, PDAF)</p></li><li><p>2MP Depth Sensor (f/2.4 aperture)</p></li><li><p><strong>Features</strong>:<br>LED flash, HDR, panorama, AI-enhanced modes</p></li><li><p><strong>Video Recording</strong>:<br>Up to 1080p at 30fps</p></li></ul></li><li><p><strong>Front Camera</strong>:</p><ul><li><p>8MP Selfie Camera (f/2.0 aperture)</p></li><li><p><strong>Features</strong>:<br>HDR, AI-enhanced portrait modes</p></li><li><p><strong>Video Recording</strong>:<br>Up to 1080p at 30fps</p></li></ul></li></ul><p></p><p></p><p><strong>🔋 Battery &amp; Charging</strong></p><ul><li><p><strong>Battery Capacity</strong>:<br>5800mAh non-removable Li-Po battery</p></li><li><p><strong>Charging</strong>:<br>45W wired fast charging</p></li><li><p><strong>Reverse Charging</strong>:<br>Supported</p></li></ul><ul><li><p></p></li></ul><p></p><p><strong>📶 Connectivity &amp; Features</strong></p><ul><li><p><strong>Network Support</strong>:<br>5G, 4G LTE, 3G, 2G</p></li><li><p><strong>Wi-Fi</strong>:<br>802.11 a/b/g/n/ac, dual-band</p></li><li><p><strong>Bluetooth</strong>:<br>5.2, A2DP, LE</p></li><li><p><strong>NFC</strong>: Available<br>(market/region dependent)</p></li><li><p><strong>Location Services</strong>:<br>GPS, GLONASS, GALILEO, BDS, QZSS</p></li><li><p><strong>Audio</strong>:<br>Stereo speakers, 3.5mm headphone jack</p></li><li><p><strong>Security</strong>:<br>Side-mounted fingerprint sensor, face unlock</p></li><li><p><strong>Additional Features</strong>:<br>AI LinkBoost for enhanced connectivity, IP68/IP69-rated for dust and water<br>resistance</p></li></ul><p></p>	OPPO	360800.00	\N	5	0	0	2026-03-26 22:58:52.625	2026-03-27 17:33:26.635	cmk628w1700032cvj9awpbifq	f	t	5	\N	\N	ACTIVE	1	\N	t	f	Express	0	f	0	cmn803wni000a8svjstuwe25s	\N
cmn81bhut000d8svj516y6f82	Samsung Galaxy Z Flip6 12GB RAM + 512GB	samsung-galaxy-z-flip6-12gb-ram--512gb-1774563544740	<p><strong>Specifications</strong></p><ul><li><p><strong>Processor</strong>:<br>Qualcomm Snapdragon 8 Gen 3 (4nm)</p></li><li><p><strong>RAM</strong>: 12GB</p></li><li><p><strong>Storage</strong>:<br>512GB (non-expandable)</p></li><li><p><strong>Main Display</strong>:<br>6.7-inch Foldable Dynamic LTPO AMOLED 2X</p><ul><li><p>Resolution: 2640 x 1080 pixels (FHD+)</p></li><li><p>Refresh Rate: 120Hz</p></li></ul></li><li><p><strong>Cover Display</strong>:<br>3.4-inch Super AMOLED</p></li><li><p><strong>Rear Cameras</strong>:</p><ul><li><p>50MP main sensor (f/1.8 aperture)</p></li><li><p>12MP ultrawide sensor (f/2.2 aperture)</p></li></ul></li><li><p><strong>Front Camera</strong>:<br>10MP (f/2.2 aperture)</p></li><li><p><strong>Battery</strong>:<br>4000mAh with 25W wired charging and 15W wireless charging</p></li><li><p><strong>Operating System</strong>:<br>Android 14 with One UI 6.1.1</p></li><li><p><strong>Dimensions</strong>:</p><ul><li><p>Unfolded: 165.1 x 71.9 x 6.9 mm</p></li><li><p>Folded: 85.1 x 71.9 x 14.9 mm</p></li></ul></li><li><p><strong>Weight</strong>:<br>187g</p></li><li><p><strong>Build</strong>:<br>Armor Aluminum frame with Gorilla Glass Victus 2 protection</p></li><li><p><strong>Other Features</strong>:</p><ul><li><p>IPX8 water resistance</p></li><li><p>Side-mounted fingerprint sensor</p></li><li><p>Stereo speakers</p></li><li><p>5G connectivity</p></li><li><p>Dual SIM (Nano-SIM and eSIM)</p></li><li><p>Samsung DeX support</p></li></ul></li></ul><p><strong>🎨 Available Colors</strong></p><ul><li><p><strong>Crafted Black</strong></p></li><li><p><strong>Silver Shadow</strong></p></li><li><p><strong>Yellow</strong></p></li><li><p><strong>Mint</strong></p></li><li><p><strong>Blue</strong></p></li></ul><p></p>	SAMSUNG	1900000.00	1835100.00	20	0	0	2026-03-26 22:19:08.735	2026-03-27 17:33:26.415	cmk628w1700032cvj9awpbifq	f	t	5	\N	\N	ACTIVE	2	\N	t	f	Express	1.9	f	0	cmn803wni000a8svjstuwe25s	\N
cmn83exd9000n8svja875go80	Hong hai Diecast cookware set	hong-hai-diecast-cookware-set-1774567062167	<p>Hong hai Diecast cookware set desirable for domestic and outdoor cooking of all types . very strong and durable.</p>	Diecast cookware	152000.00	\N	7	0	0	2026-03-26 23:17:47.488	2026-03-27 17:33:26.856	cmkbbx0j5000g10vjnk3v3zkd	f	t	5	\N	\N	ACTIVE	1	\N	t	f	Standard	5.1	f	0	cmn803wni000a8svjstuwe25s	\N
cmn84n6xn000r8svjm0i0qs6d	Plate Racks	plate-racks-1774569130756	<p>Very strong and fancy 3 Steps Plate Rack</p>	Plate Racks	45000.00	\N	8	0	0	2026-03-26 23:52:13.124	2026-03-27 17:33:27.07	cmkbbx0j5000g10vjnk3v3zkd	f	t	5	\N	\N	ACTIVE	2	{"[\\"plate racks\\"","\\"kitchen utensils\\"","\\"kitchen\\"]"}	t	f	Standard	3.8	f	0	cmn803wni000a8svjstuwe25s	\N
cmn84hpbo000p8svjpg8bpkmj	Silver Crest Commercial Blender	silver-crest-commercial-blender-1774568875128	<p>Silver Crest&nbsp; Commercial Blender</p><p>-5CB 505</p><p>-5500 WATT</p><p>– Very powerful and can blend everything</p>	Silver Crest	50000.00	\N	5	0	0	2026-03-26 23:47:57.213	2026-03-27 17:33:27.357	cmkbbx0j5000g10vjnk3v3zkd	f	t	5	\N	\N	ACTIVE	1	{"[\\"silvercrest\\"","\\"blender\\"","\\"kitchen utencils\\"]"}	t	f	Express	5	f	0	cmn803wni000a8svjstuwe25s	\N
cmn94xmsb000hlkvj4hc0qelt	Air Frier	air-frier-1774630084668	<p>kitchen appliance used to make fried foods</p>	Air Frier	80000.00	\N	10	0	0	2026-03-27 16:48:06.511	2026-03-27 17:33:27.684	cmkbblpt4000c10vjez13hpxf	f	t	5	\N	Air Frier	ACTIVE	002	{"[\\"air frier\\"","\\"kitchen utensil\\"]"}	t	f	Express	0	f	0	cmn803wni000a8svjstuwe25s	\N
\.


--
-- Data for Name: ProductImage; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ProductImage" (id, "productId", url, alt, "order") FROM stdin;
cmn81bi1y000e8svjhx5r31b6	cmn81bhut000d8svj516y6f82	https://res.cloudinary.com/dq0vynxci/image/upload/v1774563545/marvelmarts/products/fxqxlncczypmiuccykiy.png	Samsung Galaxy Z Flip6 12GB RAM + 512GB	0
cmn81bi1y000f8svjax1uukcf	cmn81bhut000d8svj516y6f82	https://res.cloudinary.com/dq0vynxci/image/upload/v1774563546/marvelmarts/products/xyyfwbjrosujsvxhf7iq.png	Samsung Galaxy Z Flip6 12GB RAM + 512GB	1
cmn81bi1y000g8svj728ov8n4	cmn81bhut000d8svj516y6f82	https://res.cloudinary.com/dq0vynxci/image/upload/v1774563547/marvelmarts/products/fja0bhdw67j39hf9ncnh.png	Samsung Galaxy Z Flip6 12GB RAM + 512GB	2
cmn82qmf9000k8svjhzcowmwg	cmn82qm7g000j8svj28kgqlzu	https://res.cloudinary.com/dq0vynxci/image/upload/v1774565928/marvelmarts/products/ka2c9ix8zjafzxuti2tl.png	OPPO A5 PRO 8 +256GB	0
cmn82qmf9000l8svjz9cmbguj	cmn82qm7g000j8svj28kgqlzu	https://res.cloudinary.com/dq0vynxci/image/upload/v1774565929/marvelmarts/products/hjrpz9zxr7im4xbxaxt1.png	OPPO A5 PRO 8 +256GB	1
cmn82qmf9000m8svjae55nv6o	cmn82qm7g000j8svj28kgqlzu	https://res.cloudinary.com/dq0vynxci/image/upload/v1774565931/marvelmarts/products/amjginhcduwzgukagsek.png	OPPO A5 PRO 8 +256GB	2
cmn83exx1000o8svjs156a3jf	cmn83exd9000n8svja875go80	https://res.cloudinary.com/dq0vynxci/image/upload/v1774567065/marvelmarts/products/qxljnrg3temkgffbplol.jpg	Hong hai Diecast cookware set	0
cmn84hpi3000q8svjnptunrrm	cmn84hpbo000p8svjpg8bpkmj	https://res.cloudinary.com/dq0vynxci/image/upload/v1774568876/marvelmarts/products/jwstholadepdtwz3e0x8.jpg	Silver Crest Commercial Blender	0
cmn84n73y000s8svjbouczzsb	cmn84n6xn000r8svjm0i0qs6d	https://res.cloudinary.com/dq0vynxci/image/upload/v1774569131/marvelmarts/products/mw2jvg7l7pnwmejuy6rh.jpg	Plate Racks	0
cmn94xncd000ilkvj7qntgpqk	cmn94xmsb000hlkvj4hc0qelt	https://res.cloudinary.com/dq0vynxci/image/upload/v1774630085/marvelmarts/products/nvjkb9pwnbbe6a2bhert.png	Air Frier	0
\.


--
-- Data for Name: Review; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Review" (id, "productId", "userId", rating, title, body, "createdAt", approved, cons, flagged, pros, "updatedAt", "isVerified") FROM stdin;
\.


--
-- Data for Name: Session; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Session" (id, "sessionToken", "userId", expires) FROM stdin;
\.


--
-- Data for Name: Ticket; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Ticket" (id, subject, message, status, "userEmail", "articleId", "createdAt", "updatedAt", notes) FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."User" (id, email, "passwordHash", image, "createdAt", "updatedAt", name, permissions, "IsVerified", "isSuspended", balance, roles, role, "walletBalance", phone, "paymentTypes") FROM stdin;
3072d767-e104-4a15-8b65-295e8f38fede	superadmin@marvelmarts.com	$2b$12$7dQHD4QD8vm25OVpwZ1IY.p6G5fGor1Af9IFs97YwOPOF9jOvS61C	\N	2026-03-26 18:28:31.617	2026-03-26 18:38:56.665	Super Admin	\N	t	f	0	{SUPER_ADMIN}	SUPER_ADMIN	0	\N	\N
cmn7vk7v800018svja1fktsv9	tsbolarinwa@gmail.com	$2b$12$rBhRZ64kBlrtElaCTc/TZelzkL/536FXCtqjvPO8NSDyQPsnnJfmW	\N	2026-03-26 19:37:58.268	2026-03-26 21:48:10.549	Tayo Bolarinwa	\N	t	f	0	{CUSTOMER}	VENDOR	0	\N	\N
cmn8aydn2000104l7f3b1ul9s	tayomarvel@gmail.com	$2b$12$DbW/MqmR/6l.2e3JDWWlQOwO4f1SssYat7Aam02jcBAVmSTFXI5m.	\N	2026-03-27 02:48:53.39	2026-03-27 22:24:45.993	Olaoluwa Samuel	\N	t	f	0	{CUSTOMER}	CUSTOMER	400000	\N	\N
cmndrlzb4000104l7l1mv458w	marvelcreativemedia@gmail.com	$2b$12$TjMbwHq5ii4qTwncaWEjBuG3Otg34lgQG9HNXcMxUJ0zpyLJHS61a	\N	2026-03-30 22:33:59.295	2026-03-30 22:33:59.295	Marvel Tayo	\N	t	f	0	{CUSTOMER}	CUSTOMER	0	\N	\N
\.


--
-- Data for Name: Variant; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Variant" (id, "productId", name, price, stock, attributes, sku) FROM stdin;
cmn81bi8o000h8svjbh9ii8uj	cmn81bhut000d8svj516y6f82	BLACK	1900000.00	10	{}	-1
cmn81bi8o000i8svj5t8w7wik	cmn81bhut000d8svj516y6f82	SILVER	1900000.00	10	{}	-2
\.


--
-- Data for Name: VendorBoost; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."VendorBoost" (id, "vendorProfileId", credits, "createdAt", plan, "updatedAt", "exhaustedAlertSent", "lowCreditAlertSent") FROM stdin;
\.


--
-- Data for Name: VendorOnboarding; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."VendorOnboarding" (id, "vendorProfileId", "profileDone", "storeDone", "productDone", completed) FROM stdin;
cmn807o7x000b8svjg74eztff	cmn803wni000a8svjstuwe25s	t	f	t	t
\.


--
-- Data for Name: VendorProfile; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."VendorProfile" (id, "userId", "firstName", "lastName", "storeName", "storePhone", "storeAddress", country, state, "createdAt", "updatedAt", "isVerified", bio, "coverUrl", "logoUrl", "isSuspended", "rejectionReason", status, "verificationDoc", "accountName", "accountNumber", "bankName", facebook, instagram, twitter, whatsapp, balance, "lastSyncedAt", "productDone", "profileDone", "storeDone", "businessDoc", "identityDoc", "locationDoc", "payoutsDone") FROM stdin;
cmn803wni000a8svjstuwe25s	cmn7vk7v800018svja1fktsv9	Tayo	Bolarinwa	Bola Ventures Stores	08186019049	Shop D110, Ogba Central Mall, Ogba	Nigeria	Lagos	2026-03-26 21:45:14.841	2026-03-27 03:06:23.935	t	We sell all kind of varieties of products	https://res.cloudinary.com/dq0vynxci/image/upload/v1774562010/vendors/cmn803wni000a8svjstuwe25s/branding/jcz79gaez5afrftlbczq.jpg	https://res.cloudinary.com/dq0vynxci/image/upload/v1774562031/vendors/cmn803wni000a8svjstuwe25s/branding/kyculsqfuov4gcocvbgw.jpg	f	\N	APPROVED	\N	Tayo Bolarinwa	8186019049	OPay	@tsbmarvel	@tsbmarvel	\N	@tsbmarvel	837600.00	\N	f	f	t	https://res.cloudinary.com/dq0vynxci/image/upload/v1774561614/vendor-docs/cbmvhmcmxvwx0qgeo2gy.jpg	https://res.cloudinary.com/dq0vynxci/image/upload/v1774561599/vendor-docs/sknfrhxxeszug5ouwtll.jpg	https://res.cloudinary.com/dq0vynxci/image/upload/v1774561628/vendor-docs/hmc8p3wsjqs95ybbbb1a.jpg	t
\.


--
-- Data for Name: VendorScore; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."VendorScore" (id, "vendorProfileId", score, tier) FROM stdin;
\.


--
-- Data for Name: VendorStore; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."VendorStore" (id, "vendorProfileId", slug, name, logo, banner, description, followers) FROM stdin;
cmn80hmwf000c8svjomnfivx5	cmn803wni000a8svjstuwe25s	bola-ventures-stores	Bola Ventures Stores	\N	\N	\N	0
\.


--
-- Data for Name: VendorVerification; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."VendorVerification" (id, email, code, "expiresAt", used, "createdAt") FROM stdin;
\.


--
-- Data for Name: VerificationCode; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."VerificationCode" (id, "userId", email, "hashedPassword", name, code, type, "expiresAt", used, "createdAt", "vendorData") FROM stdin;
cmn7yfwxk00038svj53vxhubq	\N	tsbolarinwa@gmail.com	\N	\N	751D5C	VENDOR_REGISTRATION	2026-03-26 21:13:36.532	t	2026-03-26 20:58:36.535	\N
cmn7z0zqn00058svj9uwczmbu	\N	tsbolarinwa@gmail.com	\N	\N	DA30DC	VENDOR_REGISTRATION	2026-03-26 21:29:59.948	t	2026-03-26 21:14:59.951	\N
cmn7zyd7u00088svjyn5hwzr9	\N	tsbolarinwa@gmail.com	\N	\N	A9259D	VENDOR_REGISTRATION	2026-03-26 21:55:57.063	f	2026-03-26 21:40:57.065	\N
cmn7zywrd00098svjosh1obi2	\N	tsbolarinwa@gmail.com	\N	\N	BE49D0	VENDOR_REGISTRATION	2026-03-26 21:56:22.39	t	2026-03-26 21:41:22.392	\N
cmn8ax84z000004l7bq80wj6v	\N	tayomarvel@gmail.com	$2b$12$DbW/MqmR/6l.2e3JDWWlQOwO4f1SssYat7Aam02jcBAVmSTFXI5m.	Olaoluwa Samuel	765697	CUSTOMER_REGISTRATION	2026-03-27 03:02:59.596	t	2026-03-27 02:47:59.603	\N
cmndn590s000cp8vj545heevv	\N	marvelcreativemedia@gmail.com	$2b$12$0FlOyXF8/SAsfgZY5TNenOkib7vd7WJZytQRXH4QMzkMr5pStLHUq	Marvel Tayo	337945	CUSTOMER_REGISTRATION	2026-03-30 20:44:00.265	t	2026-03-30 20:29:00.267	\N
cmnd3yacu0000ysvj7vehos75	\N	ajongs2007@gmail.com	$2b$12$JYsPlJqDgEdheECd/eB4ZedJN.pDQuJbpOyzF6xaLg2Ep6XeD5o3W	Marvel Tayo	217893	CUSTOMER_REGISTRATION	2026-03-30 12:02:41.885	f	2026-03-30 11:31:42.701	\N
cmnd4m41t0001ysvja5eeuhil	\N	marvelcreativemedia@gmail.com	$2b$12$ebcvj9YNbnuLRqWgdz8wpuHTrfg4lJPkXZ3ERk/g8Cy5jr/bhnCqW	Marvel Tayo	338800	CUSTOMER_REGISTRATION	2026-03-30 12:05:14.272	t	2026-03-30 11:50:14.272	\N
cmnd5yfvu0004ysvjk2w9gcm4	\N	marvelcreativemedia@gmail.com	$2b$12$Zs4Sv7Cb72sJIiHSzdlBmeoOGNlf068VivUOu0meq9RGYuVmAfP6W	Marvel Tayo	656834	CUSTOMER_REGISTRATION	2026-03-30 12:42:49.092	t	2026-03-30 12:27:49.098	\N
cmnd99u330007ysvjg4a6jbm1	\N	marvelcreativemedia@gmail.com	$2b$12$G83PIusQWErcxW0qqs3d6uOsCjK7UV.yChb5fV2jFJWhE1COuQrxu	Marvel Tayo	129416	CUSTOMER_REGISTRATION	2026-03-30 14:15:39.565	f	2026-03-30 14:00:39.566	\N
cmnd9a1ew0008ysvj9nlt80wr	\N	marvelcreativemedia@gmail.com	$2b$12$ALdJHzXh6ar.UodWfR9h7eN0JJTywRAipbCpTK/NdhvK/9iKlcDV6	Marvel Tayo	502371	CUSTOMER_REGISTRATION	2026-03-30 14:15:49.063	t	2026-03-30 14:00:49.064	\N
cmndah37r000bysvj3oqrypyr	\N	marvelcreativemedia@gmail.com	$2b$12$Xs8AGOFWWcJ5nbVF56Mty.rIpPAKghc0DLAuZxUrA7wOpC9usa3Ae	Marvel Tayo	520771	CUSTOMER_REGISTRATION	2026-03-30 14:49:17.605	t	2026-03-30 14:34:17.607	\N
cmndbqe9b0000p8vjphdt9kmz	\N	marvelcreativemedia@gmail.com	$2b$12$N1JeqFQ6hKsC5e7AX7qeUeLPs71ukVU8RQqJfPpUsMax7WPQfZ7IC	Marvel Tayo	173830	CUSTOMER_REGISTRATION	2026-03-30 15:24:31.431	t	2026-03-30 15:09:31.439	\N
cmndddone000004l59dl87cok	\N	marvelcreativemedia@gmail.com	$2b$12$NXZRYwSvcZk9yi7SS1nN.OZxJmV0I1mAXTkSwYn.iSM1BwMnYqmKa	Marvel Tayo	353729	CUSTOMER_REGISTRATION	2026-03-30 16:10:37.601	t	2026-03-30 15:55:37.61	\N
cmnddmko9000104ldlhpiybni	\N	marvelcreativemedia@gmail.com	$2b$12$5HxgLA10TGmgH/UqgXmqNOPwbHrYC2LMHMdTGs9jNZezbG0ilVKQi	Marvel Tayo	245462	CUSTOMER_REGISTRATION	2026-03-30 16:17:32.358	t	2026-03-30 16:02:32.361	\N
cmndelrrc0003p8vjysmjmc7g	\N	marvelcreativemedia@gmail.com	$2b$12$1dNViYd8h6gWZJmyauc7YuY6UMMDOWet4QRjRGugWz9cpvcfCYdg.	Marvel Tayo	822556	CUSTOMER_REGISTRATION	2026-03-30 16:44:54.5	t	2026-03-30 16:29:54.503	\N
cmndeqctw0006p8vjt92sf00u	\N	marvelcreativemedia@gmail.com	$2b$12$puZcUkhgt0Iec8.gjyrieOzUJgLkfPtJBCJ4P9WA3ahjrET2p87CO	Marvel Tayo	695737	CUSTOMER_REGISTRATION	2026-03-30 16:48:28.434	t	2026-03-30 16:33:28.435	\N
cmndf3ckp0009p8vjsuaixdkt	\N	marvelcreativemedia@gmail.com	$2b$12$kmTZIlPm3XVhe2YleHmQfeVchjMcQrK3xwK/5ST8wOObE.qH07896	Marvel Tayo	295614	CUSTOMER_REGISTRATION	2026-03-30 16:58:34.631	t	2026-03-30 16:43:34.633	\N
cmndfjlp0000004jfuyngs7ud	\N	marvelcreativemedia@gmail.com	$2b$12$zHtP46Uqp02GyiE9.8mYY.12uXjEmYjZ.1GJaLqp.GLILeYg2LMmy	Marvel Tayo	222047	CUSTOMER_REGISTRATION	2026-03-30 17:11:12.941	t	2026-03-30 16:56:12.948	\N
cmndgpfx9000004i9gh7x3g4c	\N	marvelcreativemedia@gmail.com	$2b$12$xQaC/.4LU1QF5I4cy8BlK.jCdPkxaLvC8TNoFWWSFBWNKqqtK8lJi	Marvel Tayo	908979	CUSTOMER_REGISTRATION	2026-03-30 17:43:45.013	t	2026-03-30 17:28:45.021	\N
cmndqiizy000004l7mr5ub2bd	\N	ajongs2007@gmail.com	$2b$12$HIBQIzIUzd5Qe9O4gXaogOloEcAajP18RW7TzcAgokBkpjCEAwFsa	Adetayo Ezekiel	446233	CUSTOMER_REGISTRATION	2026-03-30 22:18:18.567	t	2026-03-30 22:03:18.574	\N
cmndqylnj000504l73mtr3s4x	\N	marvelcreativemedia@gmail.com	$2b$12$z6rtDackuyOmZtNr9jAjz.wcZnGieJjVLePK7L6wNhJfsQcgFZ4zW	Marvel Tayo	516131	CUSTOMER_REGISTRATION	2026-03-30 22:30:48.51	t	2026-03-30 22:15:48.511	\N
cmndrknq8000004l7z51zsk2g	\N	marvelcreativemedia@gmail.com	$2b$12$TjMbwHq5ii4qTwncaWEjBuG3Otg34lgQG9HNXcMxUJ0zpyLJHS61a	Marvel Tayo	529036	CUSTOMER_REGISTRATION	2026-03-30 22:47:57.625	t	2026-03-30 22:32:57.632	\N
\.


--
-- Data for Name: Wallet; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Wallet" (id, "userId", balance, currency, "updatedAt") FROM stdin;
cmn8wxx5e0001nsvjlmeaglld	cmn8aydn2000104l7f3b1ul9s	5000.00	NGN	2026-03-27 13:04:23.57
\.


--
-- Data for Name: WalletTransaction; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."WalletTransaction" (id, "walletId", amount, type, status, reference, description, "createdAt") FROM stdin;
cmn8wxxc00002nsvj4dtq0en1	cmn8wxx5e0001nsvjlmeaglld	5000.00	TOPUP	SUCCESS	T171823158512615	Wallet Top-up via Paystack	2026-03-27 13:04:23.808
\.


--
-- Data for Name: Wishlist; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Wishlist" (id, "userId", "productId", "createdAt") FROM stdin;
cmn9ggkjv000slkvjnfgvy91s	cmn7vk7v800018svja1fktsv9	cmn83exd9000n8svja875go80	2026-03-27 22:10:46.41
cmn9ggknc000tlkvjo4qs5wg1	cmn7vk7v800018svja1fktsv9	cmn82qm7g000j8svj28kgqlzu	2026-03-27 22:10:46.536
cmn9ggkpe000ulkvjk16lcv2y	cmn7vk7v800018svja1fktsv9	cmn84hpbo000p8svjpg8bpkmj	2026-03-27 22:10:46.61
\.


--
-- Data for Name: Withdrawal; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Withdrawal" (id, "vendorProfileId", amount, status, reference, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: _ProductCategories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."_ProductCategories" ("A", "B") FROM stdin;
cmkbblpt4000c10vjez13hpxf	cmn84hpbo000p8svjpg8bpkmj
cmkbbx0j5000g10vjnk3v3zkd	cmn84hpbo000p8svjpg8bpkmj
cmkbblpt4000c10vjez13hpxf	cmn94xmsb000hlkvj4hc0qelt
cmkbbx0j5000g10vjnk3v3zkd	cmn94xmsb000hlkvj4hc0qelt
\.


--
-- Data for Name: _ProductToFlashSale; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."_ProductToFlashSale" ("A", "B") FROM stdin;
\.


--
-- Data for Name: _UserConversations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."_UserConversations" ("A", "B") FROM stdin;
cmn9jwo1d000004ld9ittff31	cmn7vk7v800018svja1fktsv9
cmn9jwo1d000004ld9ittff31	cmn8aydn2000104l7f3b1ul9s
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
ca8d9321-64a1-417e-8b69-af7f4bbcbafc	861c51f352b60b99ecc0851a9dedf404d32921a048ea3c76c1f79e4a94443557	2026-03-26 01:32:23.777974+00	20260129001815_marvelmarts_upgrade	\N	\N	2026-03-26 01:32:22.692651+00	1
0b4c2988-8d5e-46e0-ac57-d8419d9000c6	71444701c5851adacb70bbfcc09e858c148188537e34bed39a60ddef09598add	2026-03-26 01:31:41.671985+00	20251117161602_marvelmartsmg	\N	\N	2026-03-26 01:31:32.631661+00	1
d66da83b-c6bf-4337-997d-935d92bcf7e1	d42f2d10ffa5f6586668ae698b8facce46a58a28ac711f580b0b6fc53544bacf	2026-03-26 01:32:09.849745+00	20260117020842_marvelmarts_next_new	\N	\N	2026-03-26 01:32:08.767137+00	1
9b599626-b9b9-4838-9fd4-0777bbc052ff	4857d5a28b0756017b71b641fcc5289a5d7cfdae3622d3bdd82233234ecbd138	2026-03-26 01:31:44.094022+00	20251128223252_vendor_setup	\N	\N	2026-03-26 01:31:42.105282+00	1
dd1a6531-8d0e-4cb1-838d-48cadd05ccf3	16941f2129c77c73af776b202808edb3a4f6dd91ee9d08489055bc4d94fdba37	2026-03-26 01:31:45.621189+00	20251129011421_add_first_name_and_last_name_to_user_setup_remove_name	\N	\N	2026-03-26 01:31:44.53825+00	1
b7ae32d3-bd97-4afd-93ab-db89da03ed11	92e5f8c4a70a3945980799a87fad3ffd12c6c5412f27ae770e9768a7398128c0	2026-03-26 01:31:47.832559+00	20251130173346_init	\N	\N	2026-03-26 01:31:46.052292+00	1
681417b3-0b55-43a3-87cd-fb1057ccebae	b0dbe7c786d8c2ce49ee3ebb38288a09e2acb5ddfb4fc572fbb726c5fa6fc6f0	2026-03-26 01:32:11.371155+00	20260117022831_marvelmarts_mig_update	\N	\N	2026-03-26 01:32:10.282883+00	1
1daa9cea-c5ec-4d46-83c1-082a11bce42a	eec329b0c9151d0aad5c8899682ea5eeaa3bba0be5955f443dc3b2f31103029b	2026-03-26 01:31:52.878451+00	20251207192640_init	\N	\N	2026-03-26 01:31:48.272052+00	1
003a90a2-ce01-4ef3-84ef-c8d383e8d792	a89012c73d74fc9921c709c54e8cc1ca0ec13044e74effd90ae196f9e66c8ce0	2026-03-26 01:31:55.270255+00	20251211004343_update_user_model	\N	\N	2026-03-26 01:31:53.312275+00	1
3c434ab6-0806-4575-be3c-311501997fd2	6360a9c0a886cd811a1902f39398c66bed67550e37c82fd19c07966e8109e523	2026-03-26 01:32:40.112626+00	20260204171212_migrate_update	\N	\N	2026-03-26 01:32:39.024953+00	1
3d6b47f6-b12b-484e-98fc-b5fca0fdcf82	0bc560d88ec3440d46dc0fb12578773b08a2c613285db2ba1d82f1fa39e88948	2026-03-26 01:31:57.007272+00	20251217221523_marvelmarts_new	\N	\N	2026-03-26 01:31:55.702037+00	1
72adcf22-0b03-4a2d-b7e5-7468c270eb47	15d0e2905d222090ffd4bc73a92f2df6b2158a8efa0d94721952d74016c3e98f	2026-03-26 01:32:12.895109+00	20260117032837_marvelmarts_update_once	\N	\N	2026-03-26 01:32:11.80818+00	1
842a458a-7b80-459c-a8dd-afab40732694	9a093cb1b73a7bcd282317a5757bbe11eb2e2df061550d66f5cfe72197c3f2fe	2026-03-26 01:31:58.525123+00	20251222205106_add_category_image_seo_fields	\N	\N	2026-03-26 01:31:57.439263+00	1
3c8b4759-9c4a-487a-888c-385a7e0d81ee	4af177ee256117fa7e55ca3b0be8831b06b1177c81c66caec499fcfbd1f58fd9	2026-03-26 01:32:01.574877+00	20251226001746_marvelmarts_updated	\N	\N	2026-03-26 01:31:58.958935+00	1
c5c94c61-0962-40a9-a008-e2e445c8f3bd	ef5d3ff1d35e7781bdd6a4e08beb96eb682fedd0878f67d03103da4c392e535d	2026-03-26 01:32:25.293634+00	20260130124926_marvelmarts_update	\N	\N	2026-03-26 01:32:24.211162+00	1
dee6374f-1f62-4cb2-a3e9-8a63cb0e9998	ad2a1e7de5d54a857b89e35ade374535d4cf48b82c1be9ae0547c80c74398846	2026-03-26 01:32:03.312747+00	20251226214841_add_variant_sku_optional	\N	\N	2026-03-26 01:32:02.008323+00	1
0e2c4310-5f04-4b78-a5fb-95f3d12e317a	2dcc942bdab2fdbaa4977d2fdd08a50b1dda2a5d540a5c329743ec487e354dcc	2026-03-26 01:32:14.85621+00	20260117064545_marvelmarts_newly_mig	\N	\N	2026-03-26 01:32:13.327621+00	1
a6a97738-7d7a-4e12-98d1-2de0ecb43411	4cbd11799b449694dcd73d8df9003c12e0575baf59a5de632a43df34286c61ef	2026-03-26 01:32:04.858873+00	20260104220835_marvelmarts_fresh	\N	\N	2026-03-26 01:32:03.744247+00	1
77b72e23-12b9-4aff-a5d0-a440fed95106	1875ee4df9855cf5e14b93e754b72e5e195d9aac40225a2ea4706f320ae6f87b	2026-03-26 01:32:06.372502+00	20260114180426_marvelmarts_upgrade	\N	\N	2026-03-26 01:32:05.290754+00	1
ce356b01-7bf9-476a-a5eb-26398c35073a	f76c1f95c4dd49376d3c14a7d369e2b3f7510d3ab664ad2ff0971cd4bec0415a	2026-03-26 01:32:08.333129+00	20260116225205_marvelmart_new_mig	\N	\N	2026-03-26 01:32:06.805131+00	1
15991f10-e4f2-45dc-9a4a-d635cbf23d67	1908f1756b0613aac0e68fbc7c0b22d49f81b867fa5248b939230bfb9324e184	2026-03-26 01:32:16.815019+00	20260118173933_marvelmarts_new_upgrade	\N	\N	2026-03-26 01:32:15.292322+00	1
73946e57-7d6f-4597-964b-df748996637b	9203f256b370f63758118a07fb7ce536c1a7c1b703e56310846151dca80fe638	2026-03-26 01:32:35.341687+00	20260202150329_marvelmarts_migrate	\N	\N	2026-03-26 01:32:32.493584+00	1
123c4c82-d322-4981-b80f-6288f9398e6c	6f1bbb9f5f6dbee2f951b77102505fc1226f6eb188400eb5d1edaac2810490f6	2026-03-26 01:32:18.555078+00	20260119203828_new_marvelmarts_mig	\N	\N	2026-03-26 01:32:17.248833+00	1
f687eec5-fe98-44db-9dff-27c759f671c3	1ad3275fc1d41fd8dba6526300d96196542a185065b8304be39893e02365dc5d	2026-03-26 01:32:26.817542+00	20260131011102_marvelmarts_upgrade	\N	\N	2026-03-26 01:32:25.726888+00	1
f76a76e9-3bf0-474b-9a4c-7f6826063b24	5b6e8e8005cdec6a975bda83fef4232baf1177af800ba239918a274d77f99c18	2026-03-26 01:32:20.089097+00	20260119210623_migrate_marvelmarts	\N	\N	2026-03-26 01:32:18.988159+00	1
888ac0cb-7aec-484a-9d44-2d487df24f1e	16b817fb373b84f5eb237b3c09f1f8f16b773950c3bcda7a13a9ac1347047730	2026-03-26 01:32:22.260065+00	20260128212032_migration_update	\N	\N	2026-03-26 01:32:20.520858+00	1
2da7ace8-7d34-4e9a-ba76-e3775c4a1353	d5f6019c15ffd03e05cd6c17c5eb7bda9ab12d1a15bf9f2954531910f6745bec	2026-03-26 01:32:29.010059+00	20260131034151_migration_update	\N	\N	2026-03-26 01:32:27.249059+00	1
cf66e8be-c937-4787-af66-3615bc7ec118	dd58c39f1c85462b2792bd3b520b0b403173377c5d942fd6961e0fa0f1e53dbe	2026-03-26 01:32:36.8583+00	20260202212214_update_migration	\N	\N	2026-03-26 01:32:35.773402+00	1
d2460ca2-5678-4fde-8e13-7e68c8475aee	8c3414a352f2bd4368903158d0573c46b962f5b9301563aee9652681809cafac	2026-03-26 01:32:30.544219+00	20260131224004_migrate_marvelmarts	\N	\N	2026-03-26 01:32:29.453382+00	1
2311df23-02f6-4df1-b0f7-d31e3f99d74c	80459668529212d19e4afed2cec8ac5cc67c441e20c11615b1503c8b49b09a40	2026-03-26 01:32:32.058284+00	20260201021945_update_marvelmarts	\N	\N	2026-03-26 01:32:30.977088+00	1
3a3f4a21-3160-4de2-a490-1ce33896668e	773a94890cc88d8cbd5fcb94640adf8db8d331071a51d801a2ff382e571115cd	2026-03-26 01:32:50.172805+00	20260210040703_upgrade_marvelmarts	\N	\N	2026-03-26 01:32:45.551859+00	1
8b1d2486-297d-4fd4-8947-b9be2b7c1a14	9c85ba61fea8417d5b6a973efd5d744ff5031aac81bea909f91519bb8900571b	2026-03-26 01:32:38.593319+00	20260204133117_migrate_new	\N	\N	2026-03-26 01:32:37.290092+00	1
1ac8300b-7e54-41c8-a1d5-4b23eb439fe5	7cac9cbf9a8bbac3cb1771ba74d5510ba3be2aabf62cb4eaa54daee35c750e16	2026-03-26 01:32:45.120075+00	20260209013719_migration_update	\N	\N	2026-03-26 01:32:44.031285+00	1
9c315702-e0c9-4ab6-bbcb-42d318ccd810	bce6e6b89ead2a770cd3a3e0f97bc5acce7a548a05c067d24bd39910e12310ca	2026-03-26 01:32:41.632245+00	20260204234506_migration_update	\N	\N	2026-03-26 01:32:40.545645+00	1
ae1fb981-4a03-4705-91a5-b268542b58b9	907e3f3fa89b379f4bf49388b746e521ec151dffbcb56c23e44d83c6015714c2	2026-03-26 01:32:43.591607+00	20260205184956_allow_user_deletion	\N	\N	2026-03-26 01:32:42.064775+00	1
0dcd28c1-bd36-40bd-b6d8-b82e3b084ae8	7ca5a6c0531eb4573ada1b92c8e52b344f605863a44645d15efb7e0a32724a1b	2026-03-26 01:32:52.559626+00	20260210211304_add_vendor_relations	\N	\N	2026-03-26 01:32:50.604387+00	1
f9e11349-4cf3-48e2-864f-6db8e998b453	d8b937684e86a625208f49c82ea5643c941cd72b65d17b869f415396bc900bb7	2026-03-26 01:32:54.299198+00	20260210230952_marvelmarts_migrate	\N	\N	2026-03-26 01:32:52.994957+00	1
0578b009-b093-4504-9f65-3ea4db2bbcf2	1f92041027516fc62def67aba1b3628af70c8139875cf1f7be35714571fd2b2d	2026-03-26 01:32:55.823008+00	20260211204613_migrate_update	\N	\N	2026-03-26 01:32:54.730338+00	1
a4c49401-e1fb-4742-a571-f3d7cb3abae0	6f52ad8b4e97e7047554d83a08dea1b70e20b1a293d1e824133c906555e32b51	2026-03-26 01:32:57.566133+00	20260211234703_upgrade_migration	\N	\N	2026-03-26 01:32:56.256996+00	1
706e8cfe-03ab-4f64-a67f-e6e094b0e41c	4f988dc8a9a5293a66ce082480e11aa86f2f84b8a9e095d83e40533a0a656266	2026-03-26 01:32:59.081463+00	20260215233405_migrate_update	\N	\N	2026-03-26 01:32:57.997648+00	1
93cafa0f-b474-41c7-9d69-471df7b63e9b	7c9269bdb4886f803e99a06f935a3581c75da8377a01d2960665e034474f08da	2026-03-26 01:33:37.923018+00	20260228162417_update_migrate_marvelmarts	\N	\N	2026-03-26 01:33:36.820726+00	1
2ab78dac-b4f2-482e-8ae1-bed829153048	92caf8dd647a96633a3cef0bc4144bc7a59e212ec620bcd64c928b09a8bc7430	2026-03-26 01:33:00.613654+00	20260217000917_migrate_marvelmarts	\N	\N	2026-03-26 01:32:59.515317+00	1
1c0bec44-3dc3-48aa-be6b-3b99d597729d	2025bc0e049504d437898471bb8dddd1b62f9ec810958f8aad19f39afc1e381c	2026-03-26 01:33:24.796242+00	20260226174221_marvelmarts_migration	\N	\N	2026-03-26 01:33:23.049692+00	1
505d7288-0853-4f9a-be69-2e4c8afa9edb	fc479106d0039e5586d11a8bf11936cd99cb137092e3f0e3032a97984b73fa37	2026-03-26 01:33:02.794155+00	20260219191205_marvelmarts_migrate	\N	\N	2026-03-26 01:33:01.048572+00	1
cfcaaa0f-3742-435d-a059-caca1d097cf6	a053af10bf55d4b5dc6ca1b5b621731ce447b7e8d20234f1d6846c082b9cf12a	2026-03-26 01:33:04.323205+00	20260220010224_upgrate_migration	\N	\N	2026-03-26 01:33:03.229479+00	1
a3306d72-ef35-4803-9734-b120bcb192f7	ceec597833d10fee8dbb944daf757704d599bac89c9fa0735ce51822c2f46924	2026-03-26 01:33:05.841362+00	20260220022143_migration_update	\N	\N	2026-03-26 01:33:04.756844+00	1
2ca8a77c-9d8e-4f3d-8d46-30cef264db9a	2a793e4f33654beb0b093dd6498d742c243caa0820e872fc2ba2044ad804aab9	2026-03-26 01:33:26.77394+00	20260226181644_update_migration	\N	\N	2026-03-26 01:33:25.232208+00	1
0515a3ce-41a3-4ca2-a3c7-f5ef1b7874e6	e1e71b5c8219f783c1c75baec9bca1ab42d6c195dbcc61e28f163f79f1d6bc25	2026-03-26 01:33:08.231855+00	20260220031555_sync_vendor_payouts	\N	\N	2026-03-26 01:33:06.273742+00	1
e27cc31b-7afc-4829-a3b3-874315f18bde	74b6fa4d575e931c84c5ec806e8932829684ec96a122b14fd8c5f03a26ac7139	2026-03-26 01:33:09.749408+00	20260220051213_migration_marvelmarts	\N	\N	2026-03-26 01:33:08.664791+00	1
4d381628-fe7b-49f0-9ded-9ac1574f049c	00f5f5ee6a4c22d2f65a027009e135c4c672f11bfd3add8330773aeca8bddfec	2026-03-26 01:33:52.320132+00	20260304002349_add_boost_until_to_product	\N	\N	2026-03-26 01:33:51.222745+00	1
ae9ed453-37e7-4677-b6d0-88ebd3491a0a	60fc1cfd31f863ab368f1ce52680898fc5e1a5e962ac9e98e456a1b6b94e779f	2026-03-26 01:33:11.268057+00	20260220215157_marvelmarts_migration	\N	\N	2026-03-26 01:33:10.181776+00	1
bab97f68-ba11-4890-9a13-d75251915f10	547d017b098b5fba6fad0c07ac2ebbc6d20d29292f6831af8bf685486f65b3de	2026-03-26 01:33:28.52572+00	20260227100259_upgrade_migration	\N	\N	2026-03-26 01:33:27.205077+00	1
b18b5d4e-3ddf-47c2-92ec-2f881c383a0c	8dbb5c6ad9f60fd4c0a047faba3cddcd30fd36da4c53d02a1630083997b8743e	2026-03-26 01:33:13.222273+00	20260221202044_upgrade_migration	\N	\N	2026-03-26 01:33:11.702212+00	1
713877c4-2b4e-4747-bf44-127335ba7d08	02a1e6bbf9e923024a65e76b64505b34cb3b062b39b2699037c027aad7297b6a	2026-03-26 01:33:16.312195+00	20260223134828_marvelmarts_migrate_new	\N	\N	2026-03-26 01:33:13.655952+00	1
85311310-f9f8-4a13-b457-1abdd451f5c5	8bcf666db543dcb74c656514eafaa2ba95aa9892d2f6859c5f7c019f0241caec	2026-03-26 01:33:39.67275+00	20260228200102_migration_marvemarts_upgrade	\N	\N	2026-03-26 01:33:38.358603+00	1
35a3ccc5-f080-4d71-b873-e9316212e708	8cf07ded97fd89b93dc432072b76ead63ac0d1be03ac20199b608ea7da4e8fe3	2026-03-26 01:33:17.827723+00	20260225004549_marvelmarts_upgrade	\N	\N	2026-03-26 01:33:16.743904+00	1
2323cddc-f676-472c-a0b0-43e87c3c41e0	0a6ad2b5c05cd6123cc18d575005ddc6f28b70c0453292dbf572b78bec6bc087	2026-03-26 01:33:30.050503+00	20260227104016_marvelmarts_new_migration	\N	\N	2026-03-26 01:33:28.957295+00	1
0fb7d036-f044-40ff-b975-ecd824f1591e	5fa92281523131d7b18742ca01fddff76cab655143d6016f6c1e3ed93d4a0133	2026-03-26 01:33:19.571782+00	20260226165846_add_reference_with_default	\N	\N	2026-03-26 01:33:18.262654+00	1
685a6437-7e9b-4bc3-95da-28a85a18eec5	731664994b7cab64d18f27f3e90221e6d6045a4d7ac1effc7685f7aab9c0965d	2026-03-26 01:33:21.097983+00	20260226171559_migrate_marvelmarts_update	\N	\N	2026-03-26 01:33:20.007857+00	1
6ce32d24-89e6-44cf-b5cf-2bef921a805d	8b10f2a42c261dedda7c2ab05bdbbafa2c00af3c19313c5d9bb762624aa264f4	2026-03-26 01:33:22.617151+00	20260226172143_update_migrate_marvelmarts	\N	\N	2026-03-26 01:33:21.528923+00	1
c5818b16-9db1-4e41-a16e-0d4f810b6c41	309bdc7ecc04aec527a1a6f03526d97489d8ae67cfed0d743480f6919a4e6eb3	2026-03-26 01:33:31.573026+00	20260227104949_marvelmarts_upgrade_mig	\N	\N	2026-03-26 01:33:30.485373+00	1
d8adf9e0-d9a4-4d84-9923-478dfa0f593f	f3045876fc9893fa01c180733f8387d99d57ea0652e657775770f31ce2b4f4f0	2026-03-26 01:33:47.304335+00	20260302123405_upgrade_marvelmarts_migrate	\N	\N	2026-03-26 01:33:46.210697+00	1
3e057d48-5be6-4b69-bcc0-580d003c38e8	f171b1c4e1cebbc122fc3cac4dfb6650d32770c64a0e62cc1815057cf9e5a3c9	2026-03-26 01:33:33.09951+00	20260227125510_migration_scaled	\N	\N	2026-03-26 01:33:32.009056+00	1
9b063a19-fd50-4b91-a81a-80f57a76f0ca	312877b07565072304813c7d8164f059d879273b76670464cd986935d4f60710	2026-03-26 01:33:41.192332+00	20260301021859_marvelmarts_upgrade	\N	\N	2026-03-26 01:33:40.107771+00	1
ddff8a11-ed65-4aad-ae3a-45e6a14b2771	ff1700a6ada1df3ff64efee7cba3be4d027f3c1e7d22f2b19f651ce2584e50ba	2026-03-26 01:33:34.863837+00	20260227151709_migration_marvelmarts_update	\N	\N	2026-03-26 01:33:33.534146+00	1
f65deada-6030-45ff-bb73-275790417696	108dc52ceb6d830cede13ca68938e2aa06d5c85b96d7f67737f627a7ca81eafd	2026-03-26 01:33:36.386614+00	20260227175144_migration_update	\N	\N	2026-03-26 01:33:35.295571+00	1
68a2e048-5ab2-494c-864d-5638e5b4764c	0588a65819cb87d7a3ebf4b0f17fe190f05d0d420e5dd708bd12ad5f9d372ae3	2026-03-26 01:33:42.723232+00	20260301023109_upgrade_marvelmarts	\N	\N	2026-03-26 01:33:41.629407+00	1
404b0c1a-4b89-4209-8fd0-c69756f0d266	8bb2ead7fc4d0c6bd3e8daacc91c2077b3d8b65255831a3b711fe194d4ddddc5	2026-03-26 01:33:49.04602+00	20260302154813_updated_migration	\N	\N	2026-03-26 01:33:47.740868+00	1
5f78b64d-f838-475f-8972-019e52d753c7	057c56bed8c188a940442baa0ffb31ee4454e7f36677aefeda3b26f69d2f477a	2026-03-26 01:33:44.248792+00	20260301024120_marvelmarts_updated	\N	\N	2026-03-26 01:33:43.154611+00	1
fde1a3fd-3b5f-4718-8e2e-6a586e33d0a0	ed0de93b4688f8341569186c2897e1f15cc8460643377b0b814f16455e0d5b6b	2026-03-26 01:33:45.777724+00	20260301042318_migration_marvelmarts	\N	\N	2026-03-26 01:33:44.683311+00	1
a35c8975-825e-48c6-89c3-e75cd1630756	5f411c5a194d080369672c02ea001b56278019dceaa077af733067b38d8db98c	2026-03-26 01:33:55.807189+00	20260307143342_marvelmarts_migration_upgrade	\N	\N	2026-03-26 01:33:54.72405+00	1
dd6e0f7d-b1c0-424c-a3ed-0b00f56911bb	8113a88b75c85cdd538c1070f3d2fac37d189534848afd23531457df4bca14e7	2026-03-26 01:33:50.790526+00	20260303234026_add_plan_to_vendor_boost	\N	\N	2026-03-26 01:33:49.478368+00	1
98a8355c-f473-4f7e-925d-612710dc3a14	98ad5e170b6c463785e52cbd4ab1d50095d35854089e9b75e6d3b19b8c6b650c	2026-03-26 01:33:54.290465+00	20260304025250_marvelmarts_migration_upgrade	\N	\N	2026-03-26 01:33:52.754861+00	1
43b19c64-a480-4416-8111-fe284a0e885d	34dfe88a63ba59f486b209b62407bbd51f044a359369978429d4802c244e3c48	2026-03-26 01:33:59.307682+00	20260309190643_migrate_to_multi_role_array	\N	\N	2026-03-26 01:33:58.201255+00	1
a672eb73-e650-4c63-a847-d8e5a71e3065	b06bf1f5a44194287710ae74ad1d47f6400b07878a4ac428bddc2d84ac45cc1f	2026-03-26 01:33:57.769155+00	20260307181048_migration_update	\N	\N	2026-03-26 01:33:56.23903+00	1
9f308b4d-ed70-4398-9372-c95b6d9d17e2	eaab1128fc10f46b0a0a85073c934021c9615d81b3e45163f7f59c79b7703088	2026-03-26 01:34:00.828878+00	20260309193855_migrate_to_multi_role_array	\N	\N	2026-03-26 01:33:59.74064+00	1
6622bbdb-0539-4167-bcce-84ab2f6c8290	34dfe88a63ba59f486b209b62407bbd51f044a359369978429d4802c244e3c48	2026-03-26 01:34:02.347216+00	20260309201320_update_migration_marvelmarts	\N	\N	2026-03-26 01:34:01.260257+00	1
d46ea9ce-908d-4db6-99cb-59c4ee1ff813	e8d190ca1268e6f576997e324a4f4798a4efd0bca771d6cd5495686378f2f348	2026-03-26 01:34:03.650271+00	20260310045413_convert_role_to_roles_array	\N	\N	2026-03-26 01:34:02.780782+00	1
1f8786b4-54a6-4c09-8bee-08bf904736bc	e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855	2026-03-26 01:34:04.951759+00	20260310045628_convert_role_to_roles_array	\N	\N	2026-03-26 01:34:04.082343+00	1
0c6f41a2-8c4d-4dce-9f79-711c159b7340	17023766f71b76594c022c5cf6c79b5ef52dcc5f6004babd0626c8beac75a690	2026-03-26 01:34:06.470313+00	20260312205939_marvelmarts_migration_fresh	\N	\N	2026-03-26 01:34:05.390099+00	1
2574abb2-706e-4471-8543-48ba4a69f4ce	23699d5ae0b0a2ebed42e648c9ba156652d3f721fcb69e42f64031a2eaf8173c	2026-03-26 01:34:07.989462+00	20260315183437_add_payouts_done_to_vendor	\N	\N	2026-03-26 01:34:06.903987+00	1
cec138bb-be6a-45d7-9bfc-35988778bd41	d1f1cf30356f54ed52e150df413e998ae31c2d7b732031b257fff020dd52cd27	2026-03-26 01:34:09.502957+00	20260319010223_migration_marvelmarts_update	\N	\N	2026-03-26 01:34:08.421153+00	1
d009b13d-0b9a-44b4-a5e1-d32087246fcf	48313651bc1de9ed50eb46150134c18bd1c15d4ae0bafc1b215fea6e80e6ed06	2026-03-26 01:34:11.677508+00	20260319214437_marvelmarts_prisma_update	\N	\N	2026-03-26 01:34:09.935429+00	1
38bb69ff-304e-4292-adfe-bee7dcd0ed6b	035677f4574bae447a982918b8034509eb5b3a6e22feb3ac5c71a8f7eb7bb873	2026-03-26 01:34:13.864285+00	20260324231918_marvelmarts_mig_new	\N	\N	2026-03-26 01:34:12.12002+00	1
4c5dfa24-c3c8-49ec-a5ba-dddcbc37cb14	acc5b0cb1a382ab7b5832702855d0b530c3497b2e5ae1ea2543f36a15b780979	2026-03-26 01:34:16.042684+00	20260325134411_marvelmarts_payment_migration	\N	\N	2026-03-26 01:34:14.298125+00	1
c7c79003-c9cf-4a41-a597-3fd9dadc329e	148e0d05ff1eb980c010cece8179d5d5137e901f073259d0d2d3c6a5003dc385	2026-03-26 01:34:18.666887+00	20260325163539_marvelmarts_wallet_transaction_update	\N	\N	2026-03-26 01:34:16.478072+00	1
a725c5fa-cfaa-47a4-8523-11dcf536723c	19deb64664bc17b0df7d60b222a7855401b6976d1a1a363c8dea57c1ef193c64	2026-03-26 01:34:20.186303+00	20260325184225_add_wallet_balance	\N	\N	2026-03-26 01:34:19.103666+00	1
fb7fbd3d-d512-42c5-b347-a01ce7aeb350	4dab88c54833e06aa8097db8744936bfc90dbc3da12c85e0b50099d4c16a8261	2026-03-26 01:34:22.369998+00	20260325233816_marvelmarts_migration_bank	\N	\N	2026-03-26 01:34:20.618529+00	1
394a1457-a6a6-43be-9cbe-b1922156808a	f854b96ac04f8685c60142f7e3e0e1c876c8cb449459413f49e00794333ee42a	2026-03-26 01:34:25.180434+00	20260326002730_marvelmarts_migration_payment_type	\N	\N	2026-03-26 01:34:22.801449+00	1
6b6f584f-70a5-490e-ad80-86f6c649bc59	3a53910d2239fb6682eb3c3cc1808d691bb99f3eab3757c2484b58c74fd731a5	2026-03-26 19:27:12.756669+00	20260326192709_marvelmarts_migration_payment	\N	\N	2026-03-26 19:27:10.941845+00	1
e4140523-d8e2-49c7-b06a-b380c680f4f8	3241421fc430650f3e54ba1d3f6eb0d898793bd221d248bbfed72581ac46cb0a	2026-03-27 00:04:35.047335+00	20260327000431_marvelmarts_category_upgrade	\N	\N	2026-03-27 00:04:33.12962+00	1
\.


--
-- Data for Name: site_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.site_settings (id, "createdAt", "updatedAt", "accentNavy", "brandPrimary", "brandOrangeLight", "neutralWhite", "neutralLight", "neutralGray", "neutralDark", "layoutScale", "baseFontSize", "bodyFontScale", "headingFontScale", "headerFontScale", "footerFontScale", "carouselFontScale", "headerBg", "headerText", "headerBorder", "showSearchBar", "footerBg", "footerText", "showSocialIcons", "productCardRadius", "productCardShadow", "productPriceColor", "addToCartBg", "addToCartText", "showFeaturedProducts", "showFlashSales", "showFeaturedCategories", "showNewArrivals", "showTestimonials", "cartDrawerPosition", "cartDrawerWidth", "helpMenuPosition", "showEcommerceCarousel", "showTrendingProducts", "facebookUrl", "footerBodyFontSize", "footerHeadingFontSize", "footerLogo", "instagramUrl", "twitterUrl", "whatsappUrl") FROM stdin;
\.


--
-- Name: users_sync users_sync_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.users_sync
    ADD CONSTRAINT users_sync_pkey PRIMARY KEY (id);


--
-- Name: Account Account_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_pkey" PRIMARY KEY (id);


--
-- Name: Address Address_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Address"
    ADD CONSTRAINT "Address_pkey" PRIMARY KEY (id);


--
-- Name: AdminProfile AdminProfile_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AdminProfile"
    ADD CONSTRAINT "AdminProfile_pkey" PRIMARY KEY (id);


--
-- Name: BankAccount BankAccount_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BankAccount"
    ADD CONSTRAINT "BankAccount_pkey" PRIMARY KEY (id);


--
-- Name: Blog Blog_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Blog"
    ADD CONSTRAINT "Blog_pkey" PRIMARY KEY (id);


--
-- Name: CartItem CartItem_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CartItem"
    ADD CONSTRAINT "CartItem_pkey" PRIMARY KEY (id);


--
-- Name: Cart Cart_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Cart"
    ADD CONSTRAINT "Cart_pkey" PRIMARY KEY (id);


--
-- Name: Category Category_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_pkey" PRIMARY KEY (id);


--
-- Name: Conversation Conversation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Conversation"
    ADD CONSTRAINT "Conversation_pkey" PRIMARY KEY (id);


--
-- Name: Coupon Coupon_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Coupon"
    ADD CONSTRAINT "Coupon_pkey" PRIMARY KEY (id);


--
-- Name: CreditTransaction CreditTransaction_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CreditTransaction"
    ADD CONSTRAINT "CreditTransaction_pkey" PRIMARY KEY (id);


--
-- Name: CustomerProfile CustomerProfile_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CustomerProfile"
    ADD CONSTRAINT "CustomerProfile_pkey" PRIMARY KEY (id);


--
-- Name: Dispute Dispute_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Dispute"
    ADD CONSTRAINT "Dispute_pkey" PRIMARY KEY (id);


--
-- Name: EmailVerification EmailVerification_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."EmailVerification"
    ADD CONSTRAINT "EmailVerification_pkey" PRIMARY KEY (id);


--
-- Name: FlashSale FlashSale_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."FlashSale"
    ADD CONSTRAINT "FlashSale_pkey" PRIMARY KEY (id);


--
-- Name: HelpArticle HelpArticle_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."HelpArticle"
    ADD CONSTRAINT "HelpArticle_pkey" PRIMARY KEY (id);


--
-- Name: Message Message_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_pkey" PRIMARY KEY (id);


--
-- Name: NewsletterSubscriber NewsletterSubscriber_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."NewsletterSubscriber"
    ADD CONSTRAINT "NewsletterSubscriber_pkey" PRIMARY KEY (id);


--
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);


--
-- Name: OrderItem OrderItem_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_pkey" PRIMARY KEY (id);


--
-- Name: Order Order_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_pkey" PRIMARY KEY (id);


--
-- Name: PasswordResetToken PasswordResetToken_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PasswordResetToken"
    ADD CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY (id);


--
-- Name: PaymentMethod PaymentMethod_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PaymentMethod"
    ADD CONSTRAINT "PaymentMethod_pkey" PRIMARY KEY (id);


--
-- Name: Payout Payout_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Payout"
    ADD CONSTRAINT "Payout_pkey" PRIMARY KEY (id);


--
-- Name: ProductImage ProductImage_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProductImage"
    ADD CONSTRAINT "ProductImage_pkey" PRIMARY KEY (id);


--
-- Name: Product Product_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_pkey" PRIMARY KEY (id);


--
-- Name: Review Review_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_pkey" PRIMARY KEY (id);


--
-- Name: Session Session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_pkey" PRIMARY KEY (id);


--
-- Name: Ticket Ticket_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Ticket"
    ADD CONSTRAINT "Ticket_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: Variant Variant_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Variant"
    ADD CONSTRAINT "Variant_pkey" PRIMARY KEY (id);


--
-- Name: VendorBoost VendorBoost_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."VendorBoost"
    ADD CONSTRAINT "VendorBoost_pkey" PRIMARY KEY (id);


--
-- Name: VendorOnboarding VendorOnboarding_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."VendorOnboarding"
    ADD CONSTRAINT "VendorOnboarding_pkey" PRIMARY KEY (id);


--
-- Name: VendorProfile VendorProfile_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."VendorProfile"
    ADD CONSTRAINT "VendorProfile_pkey" PRIMARY KEY (id);


--
-- Name: VendorScore VendorScore_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."VendorScore"
    ADD CONSTRAINT "VendorScore_pkey" PRIMARY KEY (id);


--
-- Name: VendorStore VendorStore_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."VendorStore"
    ADD CONSTRAINT "VendorStore_pkey" PRIMARY KEY (id);


--
-- Name: VendorVerification VendorVerification_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."VendorVerification"
    ADD CONSTRAINT "VendorVerification_pkey" PRIMARY KEY (id);


--
-- Name: VerificationCode VerificationCode_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."VerificationCode"
    ADD CONSTRAINT "VerificationCode_pkey" PRIMARY KEY (id);


--
-- Name: WalletTransaction WalletTransaction_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WalletTransaction"
    ADD CONSTRAINT "WalletTransaction_pkey" PRIMARY KEY (id);


--
-- Name: Wallet Wallet_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Wallet"
    ADD CONSTRAINT "Wallet_pkey" PRIMARY KEY (id);


--
-- Name: Wishlist Wishlist_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Wishlist"
    ADD CONSTRAINT "Wishlist_pkey" PRIMARY KEY (id);


--
-- Name: Withdrawal Withdrawal_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Withdrawal"
    ADD CONSTRAINT "Withdrawal_pkey" PRIMARY KEY (id);


--
-- Name: _ProductCategories _ProductCategories_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_ProductCategories"
    ADD CONSTRAINT "_ProductCategories_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: _ProductToFlashSale _ProductToFlashSale_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_ProductToFlashSale"
    ADD CONSTRAINT "_ProductToFlashSale_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: _UserConversations _UserConversations_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_UserConversations"
    ADD CONSTRAINT "_UserConversations_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: site_settings site_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_pkey PRIMARY KEY (id);


--
-- Name: users_sync_deleted_at_idx; Type: INDEX; Schema: neon_auth; Owner: -
--

CREATE INDEX users_sync_deleted_at_idx ON neon_auth.users_sync USING btree (deleted_at);


--
-- Name: Account_provider_providerAccountId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON public."Account" USING btree (provider, "providerAccountId");


--
-- Name: AdminProfile_userId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "AdminProfile_userId_key" ON public."AdminProfile" USING btree ("userId");


--
-- Name: BankAccount_userId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "BankAccount_userId_key" ON public."BankAccount" USING btree ("userId");


--
-- Name: Blog_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Blog_slug_idx" ON public."Blog" USING btree (slug);


--
-- Name: Blog_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Blog_slug_key" ON public."Blog" USING btree (slug);


--
-- Name: Cart_userId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Cart_userId_key" ON public."Cart" USING btree ("userId");


--
-- Name: Category_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Category_slug_key" ON public."Category" USING btree (slug);


--
-- Name: Coupon_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Coupon_code_key" ON public."Coupon" USING btree (code);


--
-- Name: CreditTransaction_reference_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "CreditTransaction_reference_key" ON public."CreditTransaction" USING btree (reference);


--
-- Name: CustomerProfile_userId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "CustomerProfile_userId_key" ON public."CustomerProfile" USING btree ("userId");


--
-- Name: EmailVerification_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "EmailVerification_email_key" ON public."EmailVerification" USING btree (email);


--
-- Name: HelpArticle_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "HelpArticle_slug_key" ON public."HelpArticle" USING btree (slug);


--
-- Name: HelpArticle_title_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "HelpArticle_title_slug_idx" ON public."HelpArticle" USING btree (title, slug);


--
-- Name: NewsletterSubscriber_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "NewsletterSubscriber_email_key" ON public."NewsletterSubscriber" USING btree (email);


--
-- Name: Order_orderNumber_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Order_orderNumber_key" ON public."Order" USING btree ("orderNumber");


--
-- Name: Order_paymentIntentId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Order_paymentIntentId_key" ON public."Order" USING btree ("paymentIntentId");


--
-- Name: Order_refundReference_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Order_refundReference_key" ON public."Order" USING btree ("refundReference");


--
-- Name: PasswordResetToken_token_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON public."PasswordResetToken" USING btree (token);


--
-- Name: PasswordResetToken_userId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "PasswordResetToken_userId_key" ON public."PasswordResetToken" USING btree ("userId");


--
-- Name: PaymentMethod_providerId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "PaymentMethod_providerId_key" ON public."PaymentMethod" USING btree ("providerId");


--
-- Name: PaymentMethod_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PaymentMethod_userId_idx" ON public."PaymentMethod" USING btree ("userId");


--
-- Name: Payout_reference_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Payout_reference_key" ON public."Payout" USING btree (reference);


--
-- Name: Payout_vendorProfileId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Payout_vendorProfileId_idx" ON public."Payout" USING btree ("vendorProfileId");


--
-- Name: Product_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Product_slug_key" ON public."Product" USING btree (slug);


--
-- Name: Session_sessionToken_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Session_sessionToken_key" ON public."Session" USING btree ("sessionToken");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: Variant_sku_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Variant_sku_key" ON public."Variant" USING btree (sku);


--
-- Name: VendorBoost_vendorProfileId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "VendorBoost_vendorProfileId_key" ON public."VendorBoost" USING btree ("vendorProfileId");


--
-- Name: VendorOnboarding_vendorProfileId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "VendorOnboarding_vendorProfileId_key" ON public."VendorOnboarding" USING btree ("vendorProfileId");


--
-- Name: VendorProfile_userId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "VendorProfile_userId_key" ON public."VendorProfile" USING btree ("userId");


--
-- Name: VendorScore_vendorProfileId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "VendorScore_vendorProfileId_key" ON public."VendorScore" USING btree ("vendorProfileId");


--
-- Name: VendorStore_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "VendorStore_slug_key" ON public."VendorStore" USING btree (slug);


--
-- Name: VendorStore_vendorProfileId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "VendorStore_vendorProfileId_key" ON public."VendorStore" USING btree ("vendorProfileId");


--
-- Name: VendorVerification_email_code_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "VendorVerification_email_code_idx" ON public."VendorVerification" USING btree (email, code);


--
-- Name: VendorVerification_email_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "VendorVerification_email_idx" ON public."VendorVerification" USING btree (email);


--
-- Name: WalletTransaction_reference_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "WalletTransaction_reference_key" ON public."WalletTransaction" USING btree (reference);


--
-- Name: WalletTransaction_walletId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "WalletTransaction_walletId_idx" ON public."WalletTransaction" USING btree ("walletId");


--
-- Name: Wallet_userId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Wallet_userId_key" ON public."Wallet" USING btree ("userId");


--
-- Name: Wishlist_userId_productId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Wishlist_userId_productId_key" ON public."Wishlist" USING btree ("userId", "productId");


--
-- Name: Withdrawal_reference_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Withdrawal_reference_key" ON public."Withdrawal" USING btree (reference);


--
-- Name: _ProductCategories_B_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "_ProductCategories_B_index" ON public."_ProductCategories" USING btree ("B");


--
-- Name: _ProductToFlashSale_B_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "_ProductToFlashSale_B_index" ON public."_ProductToFlashSale" USING btree ("B");


--
-- Name: _UserConversations_B_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "_UserConversations_B_index" ON public."_UserConversations" USING btree ("B");


--
-- Name: Account Account_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Address Address_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Address"
    ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AdminProfile AdminProfile_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AdminProfile"
    ADD CONSTRAINT "AdminProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: BankAccount BankAccount_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BankAccount"
    ADD CONSTRAINT "BankAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CartItem CartItem_cartId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CartItem"
    ADD CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES public."Cart"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CartItem CartItem_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CartItem"
    ADD CONSTRAINT "CartItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: CartItem CartItem_variantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CartItem"
    ADD CONSTRAINT "CartItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES public."Variant"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Cart Cart_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Cart"
    ADD CONSTRAINT "Cart_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Category Category_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: CreditTransaction CreditTransaction_vendorProfileId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CreditTransaction"
    ADD CONSTRAINT "CreditTransaction_vendorProfileId_fkey" FOREIGN KEY ("vendorProfileId") REFERENCES public."VendorProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CustomerProfile CustomerProfile_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CustomerProfile"
    ADD CONSTRAINT "CustomerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Dispute Dispute_raisedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Dispute"
    ADD CONSTRAINT "Dispute_raisedById_fkey" FOREIGN KEY ("raisedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Dispute Dispute_vendorProfileId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Dispute"
    ADD CONSTRAINT "Dispute_vendorProfileId_fkey" FOREIGN KEY ("vendorProfileId") REFERENCES public."VendorProfile"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Message Message_conversationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES public."Conversation"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Notification Notification_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OrderItem OrderItem_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: OrderItem OrderItem_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: OrderItem OrderItem_variantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES public."Variant"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Order Order_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Order Order_vendorProfileId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_vendorProfileId_fkey" FOREIGN KEY ("vendorProfileId") REFERENCES public."VendorProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PasswordResetToken PasswordResetToken_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PasswordResetToken"
    ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PaymentMethod PaymentMethod_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PaymentMethod"
    ADD CONSTRAINT "PaymentMethod_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Payout Payout_vendorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Payout"
    ADD CONSTRAINT "Payout_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Payout Payout_vendorProfileId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Payout"
    ADD CONSTRAINT "Payout_vendorProfileId_fkey" FOREIGN KEY ("vendorProfileId") REFERENCES public."VendorProfile"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ProductImage ProductImage_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProductImage"
    ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Product Product_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Product Product_vendorProfileId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_vendorProfileId_fkey" FOREIGN KEY ("vendorProfileId") REFERENCES public."VendorProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Review Review_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Review Review_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Session Session_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Variant Variant_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Variant"
    ADD CONSTRAINT "Variant_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: VendorBoost VendorBoost_vendorProfileId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."VendorBoost"
    ADD CONSTRAINT "VendorBoost_vendorProfileId_fkey" FOREIGN KEY ("vendorProfileId") REFERENCES public."VendorProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: VendorOnboarding VendorOnboarding_vendorProfileId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."VendorOnboarding"
    ADD CONSTRAINT "VendorOnboarding_vendorProfileId_fkey" FOREIGN KEY ("vendorProfileId") REFERENCES public."VendorProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: VendorProfile VendorProfile_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."VendorProfile"
    ADD CONSTRAINT "VendorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: VendorScore VendorScore_vendorProfileId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."VendorScore"
    ADD CONSTRAINT "VendorScore_vendorProfileId_fkey" FOREIGN KEY ("vendorProfileId") REFERENCES public."VendorProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: VendorStore VendorStore_vendorProfileId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."VendorStore"
    ADD CONSTRAINT "VendorStore_vendorProfileId_fkey" FOREIGN KEY ("vendorProfileId") REFERENCES public."VendorProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: VerificationCode VerificationCode_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."VerificationCode"
    ADD CONSTRAINT "VerificationCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: WalletTransaction WalletTransaction_walletId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WalletTransaction"
    ADD CONSTRAINT "WalletTransaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES public."Wallet"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Wallet Wallet_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Wallet"
    ADD CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Wishlist Wishlist_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Wishlist"
    ADD CONSTRAINT "Wishlist_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Wishlist Wishlist_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Wishlist"
    ADD CONSTRAINT "Wishlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Withdrawal Withdrawal_vendorProfileId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Withdrawal"
    ADD CONSTRAINT "Withdrawal_vendorProfileId_fkey" FOREIGN KEY ("vendorProfileId") REFERENCES public."VendorProfile"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: _ProductCategories _ProductCategories_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_ProductCategories"
    ADD CONSTRAINT "_ProductCategories_A_fkey" FOREIGN KEY ("A") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _ProductCategories _ProductCategories_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_ProductCategories"
    ADD CONSTRAINT "_ProductCategories_B_fkey" FOREIGN KEY ("B") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _ProductToFlashSale _ProductToFlashSale_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_ProductToFlashSale"
    ADD CONSTRAINT "_ProductToFlashSale_A_fkey" FOREIGN KEY ("A") REFERENCES public."FlashSale"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _ProductToFlashSale _ProductToFlashSale_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_ProductToFlashSale"
    ADD CONSTRAINT "_ProductToFlashSale_B_fkey" FOREIGN KEY ("B") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _UserConversations _UserConversations_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_UserConversations"
    ADD CONSTRAINT "_UserConversations_A_fkey" FOREIGN KEY ("A") REFERENCES public."Conversation"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _UserConversations _UserConversations_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_UserConversations"
    ADD CONSTRAINT "_UserConversations_B_fkey" FOREIGN KEY ("B") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict ZdWgvXcaahd5Yt7Y3cCGsDSICWLyvapO7pUtQlafs1WoWs7bL0Adun261sMmGl0

