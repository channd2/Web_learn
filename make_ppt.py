from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.util import Inches, Pt

prs = Presentation()
prs.slide_width  = Inches(13.33)
prs.slide_height = Inches(7.5)

# ── colour palette ──────────────────────────────────────────────
BG      = RGBColor(0x0F, 0x17, 0x2A)   # dark navy
ACCENT  = RGBColor(0x38, 0xBD, 0xF8)   # sky-blue
WHITE   = RGBColor(0xFF, 0xFF, 0xFF)
YELLOW  = RGBColor(0xFB, 0xBF, 0x24)
GREEN   = RGBColor(0x34, 0xD3, 0x99)
GRAY    = RGBColor(0xCB, 0xD5, 0xE1)
ORANGE  = RGBColor(0xFB, 0x92, 0x3C)

# ── helpers ─────────────────────────────────────────────────────
def blank_slide(prs):
    blank = prs.slide_layouts[6]          # completely blank
    return prs.slides.add_slide(blank)

def fill_bg(slide, color=BG):
    from pptx.oxml.ns import qn
    from lxml import etree
    bg = slide.background
    fill = bg.fill
    fill.solid()
    fill.fore_color.rgb = color

def add_rect(slide, l, t, w, h, fill_color, alpha=None):
    shape = slide.shapes.add_shape(1, Inches(l), Inches(t), Inches(w), Inches(h))
    shape.fill.solid()
    shape.fill.fore_color.rgb = fill_color
    shape.line.fill.background()
    return shape

def add_text(slide, text, l, t, w, h,
             font_size=20, bold=False, color=WHITE,
             align=PP_ALIGN.LEFT, wrap=True):
    txb = slide.shapes.add_textbox(Inches(l), Inches(t), Inches(w), Inches(h))
    txb.word_wrap = wrap
    tf = txb.text_frame
    tf.word_wrap = wrap
    p = tf.paragraphs[0]
    p.alignment = align
    run = p.add_run()
    run.text = text
    run.font.size = Pt(font_size)
    run.font.bold = bold
    run.font.color.rgb = color
    return txb

def add_bullet_box(slide, items, l, t, w, h, title=None,
                   box_color=RGBColor(0x1E,0x2D,0x4A),
                   title_color=ACCENT, text_color=GRAY,
                   font_size=14, title_size=16):
    add_rect(slide, l, t, w, h, box_color)
    y = t + 0.15
    if title:
        add_text(slide, title, l+0.15, y, w-0.3, 0.35,
                 font_size=title_size, bold=True, color=title_color)
        y += 0.38
    tf_h = h - (y - t) - 0.1
    txb = slide.shapes.add_textbox(Inches(l+0.15), Inches(y),
                                   Inches(w-0.3), Inches(tf_h))
    txb.word_wrap = True
    tf = txb.text_frame
    tf.word_wrap = True
    first = True
    for item in items:
        p = tf.paragraphs[0] if first else tf.add_paragraph()
        first = False
        run = p.add_run()
        run.text = item
        run.font.size = Pt(font_size)
        run.font.color.rgb = text_color
    return txb

# ════════════════════════════════════════════════════════════════
# SLIDE 1 — Title
# ════════════════════════════════════════════════════════════════
sl = blank_slide(prs)
fill_bg(sl)
add_rect(sl, 0, 0, 13.33, 1.0, ACCENT)
add_text(sl, "CMMS Web Application", 0.3, 0.1, 12, 0.8,
         font_size=36, bold=True, color=BG, align=PP_ALIGN.CENTER)

add_text(sl, "From Code to Deployment — A Complete Guide",
         0.5, 1.2, 12.3, 0.6, font_size=22, color=YELLOW, align=PP_ALIGN.CENTER)

add_text(sl,
    "What is GitHub?  •  What is Supabase?  •  What is Vercel?\n"
    "How the code is created  •  Branching workflow  •  How to request changes",
    0.5, 2.0, 12.3, 1.2, font_size=16, color=GRAY, align=PP_ALIGN.CENTER)

# pipeline row
tools = [
    ("💻", "Your\nRequest", ACCENT),
    ("→",  "",            WHITE),
    ("🤖", "Claude\nAI",  GREEN),
    ("→",  "",            WHITE),
    ("🐙", "GitHub",      ORANGE),
    ("→",  "",            WHITE),
    ("▲",  "Vercel",      RGBColor(0xFF,0xFF,0xFF)),
    ("→",  "",            WHITE),
    ("🗄️", "Supabase",   YELLOW),
]
x = 0.5
for icon, label, col in tools:
    if label == "":
        add_text(sl, icon, x, 3.4, 0.4, 0.4, font_size=22, color=col, align=PP_ALIGN.CENTER)
        x += 0.45
    else:
        add_rect(sl, x, 3.2, 1.45, 0.9, RGBColor(0x1E,0x2D,0x4A))
        add_text(sl, icon, x, 3.22, 1.45, 0.4, font_size=20, color=col, align=PP_ALIGN.CENTER)
        add_text(sl, label, x, 3.6, 1.45, 0.45, font_size=11, bold=True, color=col, align=PP_ALIGN.CENTER)
        x += 1.55

add_text(sl, "Channd2 CMMS Project  |  2024",
         0, 6.9, 13.33, 0.4, font_size=11, color=GRAY, align=PP_ALIGN.CENTER)

# ════════════════════════════════════════════════════════════════
# SLIDE 2 — GitHub explained
# ════════════════════════════════════════════════════════════════
sl = blank_slide(prs)
fill_bg(sl)
add_rect(sl, 0, 0, 13.33, 0.7, ORANGE)
add_text(sl, "🐙  GitHub — The Code Storage & Version Control Hub",
         0.3, 0.05, 13, 0.55, font_size=24, bold=True, color=BG)

add_text(sl, "Think of GitHub as Google Drive — but specifically for CODE, with full history of every change.",
         0.4, 0.85, 12.5, 0.5, font_size=15, color=YELLOW)

cols = [
    ("What it stores",
     ["Every file in your website (HTML, CSS, JS, config)",
      "Complete history — who changed what, when",
      "Multiple versions (branches) at the same time",
      "Issues, comments, and change requests"]),
    ("Why we use it",
     ["Free, reliable, and industry standard",
      "Claude AI pushes code directly here",
      "Vercel reads from here to build your site",
      "You can always roll back to a previous version"]),
    ("Key concepts",
     ["Repository (repo) = your project folder",
      "Commit = a saved snapshot of changes",
      "Push = upload commits to GitHub",
      "Pull Request = request to merge changes"]),
]
x = 0.4
for title, items in cols:
    add_bullet_box(sl, items, x, 1.5, 3.95, 4.5,
                   title=title, box_color=RGBColor(0x1E,0x2D,0x4A),
                   title_color=ORANGE, font_size=13)
    x += 4.15

add_text(sl, "URL: github.com/channd2/Web_learn",
         0.4, 6.2, 12, 0.4, font_size=13, color=GRAY)

# ════════════════════════════════════════════════════════════════
# SLIDE 3 — Supabase explained
# ════════════════════════════════════════════════════════════════
sl = blank_slide(prs)
fill_bg(sl)
add_rect(sl, 0, 0, 13.33, 0.7, GREEN)
add_text(sl, "🗄️  Supabase — The Database (Where Your Data Lives)",
         0.3, 0.05, 13, 0.55, font_size=24, bold=True, color=BG)

add_text(sl, "Supabase is your backend database — it stores all real business data: assets, work orders, users, etc.",
         0.4, 0.85, 12.5, 0.5, font_size=15, color=YELLOW)

add_bullet_box(sl,
    ["Assets table — all your machines, equipment, facilities",
     "Work Orders table — maintenance tasks and their status",
     "Users table — who can log in and their roles",
     "Inventory table — spare parts and stock levels",
     "Audit logs — history of every change made"],
    0.4, 1.5, 4.5, 5.0,
    title="What data it holds", title_color=GREEN, font_size=13)

add_bullet_box(sl,
    ["Dashboard at: app.supabase.com",
     "You can view/edit data directly in the browser",
     "It generates an API automatically — Next.js uses this",
     "Row Level Security — controls who sees what",
     "Authentication — handles login sessions securely",
     "Free tier supports up to 500MB database size"],
    5.1, 1.5, 4.1, 5.0,
    title="How to access it", title_color=GREEN, font_size=13)

add_bullet_box(sl,
    ["NEXT_PUBLIC_SUPABASE_URL — the address of your database",
     "NEXT_PUBLIC_SUPABASE_ANON_KEY — public read key",
     "SUPABASE_SERVICE_ROLE_KEY — admin key (keep secret!)"],
    9.4, 1.5, 3.6, 5.0,
    title="Environment keys", title_color=GREEN, font_size=13)

# ════════════════════════════════════════════════════════════════
# SLIDE 4 — Vercel explained
# ════════════════════════════════════════════════════════════════
sl = blank_slide(prs)
fill_bg(sl)
add_rect(sl, 0, 0, 13.33, 0.7, WHITE)
add_text(sl, "▲  Vercel — The Web Host (Makes Your Site Live on the Internet)",
         0.3, 0.05, 13, 0.55, font_size=24, bold=True, color=BG)

add_text(sl, "Vercel is like a web hosting server that automatically reads from GitHub, builds, and publishes your site.",
         0.4, 0.85, 12.5, 0.5, font_size=15, color=YELLOW)

steps = [
    ("Step 1", "Connect", "Vercel links to your GitHub repo"),
    ("Step 2", "Detect",  "Sees it's a Next.js app in /cmms-app"),
    ("Step 3", "Build",   "Runs 'npm run build' automatically"),
    ("Step 4", "Deploy",  "Publishes to a .vercel.app URL"),
    ("Step 5", "Update",  "Every new push = automatic redeploy"),
]
x = 0.5
for num, title, desc in steps:
    add_rect(sl, x, 1.5, 2.35, 2.5, RGBColor(0x1E,0x2D,0x4A))
    add_text(sl, num, x, 1.55, 2.35, 0.4, font_size=12, color=GRAY, align=PP_ALIGN.CENTER)
    add_text(sl, title, x, 1.95, 2.35, 0.5, font_size=18, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
    add_text(sl, desc, x+0.1, 2.5, 2.15, 1.3, font_size=13, color=GRAY)
    x += 2.5

add_bullet_box(sl,
    ["Free tier: unlimited deploys, custom domain support",
     "Dashboard: vercel.com — see all deployments and logs",
     "Preview URLs: every branch gets its own preview link",
     "Environment Variables set here override local .env files",
     "Logs available if your site has errors after deploy"],
    0.4, 4.2, 12.5, 2.7,
    title="Key Vercel facts", title_color=WHITE, font_size=14)

# ════════════════════════════════════════════════════════════════
# SLIDE 5 — Next.js & the tech stack
# ════════════════════════════════════════════════════════════════
sl = blank_slide(prs)
fill_bg(sl)
add_rect(sl, 0, 0, 13.33, 0.7, ACCENT)
add_text(sl, "💻  The Code — Next.js, React & Tailwind CSS",
         0.3, 0.05, 13, 0.55, font_size=24, bold=True, color=BG)

add_text(sl, "These three technologies work together to create everything you see and interact with on the website.",
         0.4, 0.85, 12.5, 0.5, font_size=15, color=YELLOW)

techs = [
    ("Next.js", ACCENT,
     ["The main framework — like the blueprint of the building",
      "Handles routing: /dashboard, /assets, /work-orders",
      "Runs server-side code (API routes) AND the browser UI",
      "Lives in: /cmms-app folder",
      "Config file: next.config.js"]),
    ("React", GREEN,
     ["The UI library — builds what you SEE on screen",
      "Everything is a 'component' — a reusable building block",
      "Example: <AssetCard />, <WorkOrderTable />, <Navbar />",
      "Files end in .tsx (TypeScript + React)",
      "Lives in: /cmms-app/app and /cmms-app/components"]),
    ("Tailwind CSS", YELLOW,
     ["The styling system — controls colors, sizes, layout",
      "Written directly in the HTML as class names",
      "Example: className='bg-blue-500 text-white p-4'",
      "No separate CSS files needed",
      "Config: tailwind.config.js"]),
    ("TypeScript", ORANGE,
     ["Adds type-safety to JavaScript",
      "Catches bugs before the code runs",
      "Files end in .ts or .tsx",
      "Defined types in: /types folder",
      "Makes code more reliable and readable"]),
]
x = 0.4
for name, col, items in techs:
    add_bullet_box(sl, items, x, 1.5, 2.98, 5.0,
                   title=name, title_color=col, font_size=12)
    x += 3.15

# ════════════════════════════════════════════════════════════════
# SLIDE 6 — Full workflow: Request → Live
# ════════════════════════════════════════════════════════════════
sl = blank_slide(prs)
fill_bg(sl)
add_rect(sl, 0, 0, 13.33, 0.7, YELLOW)
add_text(sl, "🔄  Complete Workflow: From Your Request to Live Website",
         0.3, 0.05, 13, 0.55, font_size=24, bold=True, color=BG)

flow = [
    (ACCENT,  "1. You Request",
     "You describe what you want:\n'Add a filter by status to the Work Orders page'"),
    (GREEN,   "2. Claude Codes",
     "AI reads the codebase, writes the changes in the correct files, tests logic"),
    (ORANGE,  "3. Git Commit",
     "Changes are saved as a 'commit' with a description of what changed"),
    (RGBColor(0x8B,0x5C,0xF6), "4. GitHub Push",
     "The commit is uploaded (pushed) to the GitHub repository online"),
    (YELLOW,  "5. Vercel Builds",
     "Vercel detects the new push, runs 'npm run build', compiles the app"),
    (WHITE,   "6. Site is Live",
     "In ~60 seconds your updated site is live at your .vercel.app URL"),
]
x = 0.3
for col, title, desc in flow:
    add_rect(sl, x, 1.0, 2.1, 2.5, RGBColor(0x1E,0x2D,0x4A))
    add_rect(sl, x, 1.0, 2.1, 0.35, col)
    add_text(sl, title, x+0.05, 1.02, 2.0, 0.3,
             font_size=13, bold=True, color=BG, align=PP_ALIGN.CENTER)
    add_text(sl, desc, x+0.1, 1.4, 1.9, 1.5, font_size=12, color=GRAY)
    x += 2.18

# Arrow row
add_text(sl, "YOU  ──►  CLAUDE AI  ──►  GITHUB  ──►  VERCEL  ──►  LIVE SITE",
         0.5, 3.7, 12.3, 0.5, font_size=16, bold=True, color=ACCENT, align=PP_ALIGN.CENTER)

add_bullet_box(sl,
    ["This entire cycle takes about 2–5 minutes from request to live",
     "You do NOT need to install anything — Claude handles all coding",
     "You can watch the Vercel build log in real-time on vercel.com"],
    0.4, 4.4, 12.5, 2.6,
    title="Important notes", title_color=YELLOW, font_size=14)

# ════════════════════════════════════════════════════════════════
# SLIDE 7 — Branching workflow
# ════════════════════════════════════════════════════════════════
sl = blank_slide(prs)
fill_bg(sl)
add_rect(sl, 0, 0, 13.33, 0.7, ORANGE)
add_text(sl, "🌿  GitHub Branching — How Code Changes Are Organised",
         0.3, 0.05, 13, 0.55, font_size=24, bold=True, color=BG)

add_text(sl, "A 'branch' is a parallel copy of the code. Changes are made safely without breaking the live site.",
         0.4, 0.85, 12.5, 0.5, font_size=15, color=YELLOW)

# Branch diagram (text art)
add_rect(sl, 0.4, 1.5, 12.5, 3.2, RGBColor(0x1E,0x2D,0x4A))
diagram = (
    "main (LIVE SITE)  ●────────────────────────────────────────────────────►\n"
    "                         ╲                                    ╱\n"
    "claude/feature-branch     ●──── commit ──── commit ──── commit\n"
    "                                                              ╲\n"
    "                                                        Pull Request → merged to main"
)
add_text(sl, diagram, 0.6, 1.6, 12.1, 2.9,
         font_size=13, color=GREEN)

branches = [
    ("main branch",
     ["Always contains the production-ready code",
      "What Vercel deploys to your live URL",
      "Never write directly to main — always use a feature branch"]),
    ("claude/ branches",
     ["Claude always works on a branch named claude/...",
      "Example: claude/home-cmms-application-t8zuv",
      "Safe — broken code here doesn't affect your live site"]),
    ("Pull Request (PR)",
     ["When work is done, a PR is opened",
      "You can review the changes before they go live",
      "Merge the PR → Vercel rebuilds → site updates"]),
]
x = 0.4
for title, items in branches:
    add_bullet_box(sl, items, x, 4.85, 4.0, 2.3,
                   title=title, title_color=ORANGE, font_size=12)
    x += 4.15

# ════════════════════════════════════════════════════════════════
# SLIDE 8 — Folder structure
# ════════════════════════════════════════════════════════════════
sl = blank_slide(prs)
fill_bg(sl)
add_rect(sl, 0, 0, 13.33, 0.7, ACCENT)
add_text(sl, "📁  Project Folder Structure — Where Everything Lives",
         0.3, 0.05, 13, 0.55, font_size=24, bold=True, color=BG)

tree = [
    "Web_learn/                    ← root of the repository on GitHub",
    "└── cmms-app/                 ← the Next.js application (Root Directory in Vercel)",
    "    ├── app/                  ← all pages of the website",
    "    │   ├── page.tsx          ← home / login page",
    "    │   ├── dashboard/        ← main dashboard after login",
    "    │   ├── assets/           ← asset management pages",
    "    │   ├── work-orders/      ← work order pages",
    "    │   └── api/              ← server-side API routes (talks to Supabase)",
    "    ├── components/           ← reusable UI pieces (buttons, tables, cards)",
    "    ├── lib/                  ← helper functions (supabase client, auth, utils)",
    "    ├── types/                ← TypeScript type definitions",
    "    ├── public/               ← images, icons, static files",
    "    ├── .env.local            ← secret keys (NOT uploaded to GitHub)",
    "    └── package.json          ← list of all installed packages/libraries",
]
add_rect(sl, 0.4, 0.85, 12.5, 6.3, RGBColor(0x0A, 0x10, 0x1E))
add_text(sl, "\n".join(tree), 0.6, 0.9, 12.1, 6.1,
         font_size=13, color=GREEN)

# ════════════════════════════════════════════════════════════════
# SLIDE 9 — How to request changes
# ════════════════════════════════════════════════════════════════
sl = blank_slide(prs)
fill_bg(sl)
add_rect(sl, 0, 0, 13.33, 0.7, GREEN)
add_text(sl, "✏️  How to Request Further Modifications",
         0.3, 0.05, 13, 0.55, font_size=24, bold=True, color=BG)

add_bullet_box(sl,
    ["Be specific about WHAT page or feature you want to change",
      "Describe the DESIRED RESULT, not the technical steps",
      "Include examples if possible: 'like a dropdown with options A, B, C'",
      "Mention any related pages that might also need updating",
      "Say if it's urgent or for a specific upcoming date"],
    0.4, 0.85, 6.0, 3.0,
    title="How to write a good request", title_color=GREEN, font_size=13)

add_bullet_box(sl,
    ["'Add a search bar to the Assets page that filters by asset name'",
      "'Change the dashboard color scheme to darker blue'",
      "'Add a PDF export button to Work Orders'",
      "'Add a new field called Warranty Expiry Date to the asset form'",
      "'Create a new Reports page showing monthly maintenance costs'"],
    6.6, 0.85, 6.3, 3.0,
    title="Example requests", title_color=YELLOW, font_size=13)

add_bullet_box(sl,
    ["Open GitHub Issues at: github.com/channd2/Web_learn/issues",
      "Click 'New Issue', describe the change, click Submit",
      "Claude will be assigned and will implement the change",
      "A Pull Request (PR) will be opened for you to review",
      "Merge the PR to make changes go live on Vercel"],
    0.4, 4.05, 6.0, 3.1,
    title="Option A — GitHub Issue (recommended)", title_color=ACCENT, font_size=13)

add_bullet_box(sl,
    ["Chat directly with Claude Code in the terminal",
      "Type your request in plain English",
      "Claude will code, commit, and push automatically",
      "Check Vercel dashboard to confirm the deploy succeeded",
      "This is faster for small changes"],
    6.6, 4.05, 6.3, 3.1,
    title="Option B — Chat directly with Claude", title_color=ACCENT, font_size=13)

# ════════════════════════════════════════════════════════════════
# SLIDE 10 — Environment Variables explained
# ════════════════════════════════════════════════════════════════
sl = blank_slide(prs)
fill_bg(sl)
add_rect(sl, 0, 0, 13.33, 0.7, YELLOW)
add_text(sl, "🔑  Environment Variables — Secret Keys Explained",
         0.3, 0.05, 13, 0.55, font_size=24, bold=True, color=BG)

add_text(sl, "Environment variables are secret settings your app reads at runtime — like passwords stored outside the code.",
         0.4, 0.85, 12.5, 0.5, font_size=15, color=GRAY)

vars_data = [
    ("NEXT_PUBLIC_SUPABASE_URL", ACCENT,
     "The web address of your Supabase database.\nSafe to expose publicly — it's just an address."),
    ("NEXT_PUBLIC_SUPABASE_ANON_KEY", GREEN,
     "Public key for reading data from Supabase.\nSafe to expose — Supabase security rules still apply."),
    ("SUPABASE_SERVICE_ROLE_KEY", ORANGE,
     "Admin key — bypasses all security rules.\nKEEP SECRET. Only used server-side in API routes."),
    ("ADMIN_USERNAME / ADMIN_PASSWORD", YELLOW,
     "Login credentials for the CMMS admin account.\nSet during initial setup — change if needed."),
    ("JWT_SECRET", RGBColor(0x8B,0x5C,0xF6),
     "Used to sign and verify login tokens.\nMust be a long random string — never share it."),
]
y = 1.5
for key, col, desc in vars_data:
    add_rect(sl, 0.4, y, 12.5, 0.8, RGBColor(0x1E,0x2D,0x4A))
    add_rect(sl, 0.4, y, 0.08, 0.8, col)
    add_text(sl, key,  0.65, y+0.03, 4.5, 0.35, font_size=13, bold=True, color=col)
    add_text(sl, desc, 5.3,  y+0.03, 7.5, 0.7,  font_size=12, color=GRAY)
    y += 0.92

add_text(sl, "Where to set them:  Local development → .env.local file  |  Production → Vercel Dashboard → Settings → Environment Variables",
         0.4, 6.35, 12.5, 0.5, font_size=12, color=GRAY, align=PP_ALIGN.CENTER)

# ════════════════════════════════════════════════════════════════
# SLIDE 11 — Quick reference / Summary
# ════════════════════════════════════════════════════════════════
sl = blank_slide(prs)
fill_bg(sl)
add_rect(sl, 0, 0, 13.33, 0.7, ACCENT)
add_text(sl, "📋  Quick Reference Summary",
         0.3, 0.05, 13, 0.55, font_size=28, bold=True, color=BG)

summary = [
    ("Tool", "Purpose", "Your Action", WHITE),
    ("GitHub", "Stores all code + history", "View changes, merge PRs", ORANGE),
    ("Supabase", "Database — stores all your data", "View/edit data in dashboard", GREEN),
    ("Vercel", "Hosts & publishes your website", "View deployments, check logs", WHITE),
    ("Next.js", "The web app framework", "No action needed", ACCENT),
    ("Claude AI", "Writes and changes code", "Tell it what you want", YELLOW),
    (".env.local", "Local secret keys (not on GitHub)", "Never commit this file!", ORANGE),
]

y = 0.85
for row in summary:
    tool, purpose, action, col = row
    is_header = (tool == "Tool")
    bg = RGBColor(0x10,0x20,0x38) if not is_header else RGBColor(0x1E,0x3A,0x5F)
    add_rect(sl, 0.4, y, 3.5, 0.48, bg)
    add_rect(sl, 4.05, y, 5.2, 0.48, bg)
    add_rect(sl, 9.4, y, 3.5, 0.48, bg)
    add_text(sl, tool,    0.55, y+0.06, 3.3, 0.35, font_size=13, bold=is_header, color=col if not is_header else WHITE)
    add_text(sl, purpose, 4.2,  y+0.06, 5.0, 0.35, font_size=13, bold=is_header, color=GRAY if not is_header else WHITE)
    add_text(sl, action,  9.55, y+0.06, 3.3, 0.35, font_size=13, bold=is_header, color=GRAY if not is_header else WHITE)
    y += 0.52

add_bullet_box(sl,
    ["Live site: your-project.vercel.app",
      "GitHub: github.com/channd2/Web_learn",
      "Supabase: app.supabase.com",
      "Vercel: vercel.com/dashboard"],
    0.4, 5.25, 12.5, 1.9,
    title="Key links", title_color=ACCENT, font_size=14)

# ════════════════════════════════════════════════════════════════
# Save
# ════════════════════════════════════════════════════════════════
out = "/home/user/Web_learn/CMMS_Project_Guide.pptx"
prs.save(out)
print(f"Saved: {out}")
