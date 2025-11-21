Complete Layout Design Specification for Dark Mint Green Messenger App

Overall Application Structure

The application is a mobile-first messenger web app contained within a fixed viewport. The outermost container has:
Full viewport height (h-screen)
Dark gray background (#gray-900)
Flexbox display with items centered both horizontally and vertically
A centered mobile frame with max-width of 28rem (max-w-md) and full height
The mobile frame has a near-black background (#gray-950) and large shadow (shadow-xl)
All content is constrained within this mobile frame

---

1. LOGIN/REGISTER SCREEN

Container Structure
Full height flex column layout
Background: Linear gradient from emerald-900 (top-left) through teal-900 (center) to emerald-950 (bottom-right)
Single centered flex child that takes up full vertical space (flex-1)
2rem padding on all sides (p-8)

Logo Section (Top Third)
Container:
2rem bottom margin (mb-8)
Flex column with centered items
Items are stacked vertically with centered alignment

Logo Circle:
Width and height: 5rem (w-20 h-20)
Background: Emerald-400 (#10b981 at 400 shade)
Perfect circle (rounded-full)
Flexbox container with centered content
Box shadow: Large shadow with emerald-500 color at 50% opacity (shadow-lg shadow-emerald-500/50)
1rem bottom margin (mb-4)

Logo Icon:
MessageCircle icon from lucide-react
Size: 2.5rem × 2.5rem (w-10 h-10)
Color: Gray-900 (dark text on light background)

Title Text:
Text: "Messenger"
Color: White
Default heading size (inherits from globals.css h1 styles)

Subtitle Text:
Text: "Sign in to continue" or "Create your account"
Color: Emerald-200 (light mint)
Size: Small (text-sm)
Top margin: 0.5rem (mt-2)

Form Section (Middle)
Form Container:
Full width (w-full)
Max width: 32rem (max-w-sm)
Vertical spacing between fields: 1rem (space-y-4)

Each Input Field Group:
Container spacing: 0.5rem between label and input (space-y-2)

Labels:
Color: Emerald-100 (very light mint)
Text associated with input via htmlFor
Positioned above input field

Input Fields:
Background: Gray-800 with 50% opacity (bg-gray-800/50)
Border: Emerald-600 with 30% opacity (border-emerald-600/30)
Text color: White
Placeholder text: Gray-400
Full width
Standard height and padding from shadcn input component
Rounded corners (default from component)

Field Order (Login):
Username field
Password field

Field Order (Register):
Username field
Email field
Password field
Confirm Password field

Submit Button:
Full width (w-full)
Background: Emerald-500 (bright mint green)
Text color: Gray-900 (dark text on light button)
Hover state: Emerald-400 (lighter)
Standard button height and rounded corners

Account Switch Section (Bottom Third)
Container:
Top margin: 1.5rem (mt-6)
Text centered

Text Line:
Color: Emerald-100
Size: Small (text-sm)
Inline text followed by button

Switch Button:
Styled as inline text link
Left margin: 0.5rem (ml-2)
Underlined
Hover state: Emerald-300 (lighter mint)

Terms & Privacy (Register Only)
Container:
Top margin: 1rem (mt-4)
Text centered

Text:
Color: Emerald-200
Size: Extra small (text-xs)
Inline links with underline decoration

---

2. DASHBOARD WITH SIDEBAR

Overall Layout
Outer Container:
Full height flex column
No background specified (inherits from parent)

Sidebar (Top Bar):
Height: 4rem (h-16)
Background: Near-black gray-950
Border bottom: Emerald-900 with 30% opacity (border-emerald-900/30)
Flexbox row with space-between
Horizontal padding: 1rem (px-4)
Items vertically centered

Sidebar Left Section
Container:
Flex row with 0.75rem gap (gap-3)
Items vertically centered

User Avatar:
Size: 2.5rem × 2.5rem (w-10 h-10)
Circular
Cursor pointer
Hover state: 2px ring in emerald-500
Transition: All properties

User Info:
Text color: White
Username in small size (text-sm)
Single line

Sidebar Right Section (Navigation)
Container:
Flex row with 0.5rem gap (gap-2)
Items centered

Navigation Buttons:
Ghost variant
Icon only (size-icon)
Rounded-xl (larger corner radius than full)
Icon size: 1.25rem × 1.25rem (w-5 h-5)

Active State (Chats or Settings):
Background: Emerald-600
Text/Icon: White
Hover: Emerald-700

Inactive State:
Text/Icon: Gray-400
Hover background: Gray-800
Hover text: White

Divider:
Width: 1px (w-px)
Height: 1.5rem (h-6)
Background: Gray-700
Horizontal margin: 0.5rem (mx-2)
Between settings and logout buttons

Logout Button:
Same sizing as nav buttons
Text/Icon: Gray-400
Hover background: Red-600
Hover text: White

Main Content Area
Flex-1 (takes remaining vertical space)
Flex column
Overflow hidden
Contains either FriendsList, ChatWindow, or SettingsScreen

---

3. FRIENDS LIST SCREEN

Overall Container
Full height flex column
Background: Gray-900 (dark)

Header Section
Outer Container:
Padding: 1rem all sides (p-4)
Border bottom: Gray-800

Title Row:
Flex row with space-between
Items centered
Bottom margin: 1rem (mb-4)

"Messages" Title:
Text color: White
Default h2 size from globals.css

Add Friend Button:
Ghost variant
Icon only
Rounded full circle
Icon: UserPlus, size 1.25rem (w-5 h-5)
Icon color: Emerald-400
Hover text: Emerald-300
Hover background: Gray-800

Search Bar Container:
Relative positioning for icon placement

Search Icon:
Absolute positioned
Left: 0.75rem (left-3)
Top: 50%
Transform: translateY(-50%)
Size: 1rem × 1rem (w-4 h-4)
Color: Gray-500

Search Input:
Left padding: 2.5rem (pl-10) to account for icon
Background: Gray-800
Border: Gray-700
Text: White
Placeholder: Gray-500
Rounded full (pill shape)

Friend Requests Section (Conditional)
Outer Container:
Border bottom: Gray-800
Background: Emerald-950 with 30% opacity (bg-emerald-950/30)
Padding: 1rem (p-4)
Only displays if friendRequests.length > 0

Header Row:
Flex row with 0.5rem gap (gap-2)
Bottom margin: 0.75rem (mb-3)

Clock Icon:
Size: 1rem × 1rem (w-4 h-4)
Color: Emerald-400

Header Text:
Size: Small (text-sm)
Color: Emerald-400
Shows count: "Pending Requests (X)"

Request Cards Container:
Vertical spacing: 0.5rem (space-y-2)

Individual Request Card:
Flex row with 0.75rem gap (gap-3)
Items centered
Background: Gray-800
Padding: 0.75rem (p-3)
Rounded: Large (rounded-lg)
Border: Gray-700 with 1px width

Request Avatar:
Size: 2.5rem × 2.5rem (w-10 h-10)
Circular

Request Info:
Flex-1 to take available space
Min-width: 0 (for text truncation)

Username:
Truncated if too long
Color: White

Subtitle:
Text: "Friend request"
Size: Extra small (text-xs)
Color: Gray-400

Action Buttons Container:
Flex row with 0.25rem gap (gap-1)

Accept Button:
Size: Small (sm)
Background: Emerald-600
Hover: Emerald-700
Height: 2rem (h-8)
Horizontal padding: 0.75rem (px-3)
Text: "Accept"

Decline Button:
Size: Small (sm)
Variant: Outline
Height: 2rem (h-8)
Horizontal padding: 0.75rem (px-3)
Border: Gray-600
Text color: Gray-300
Hover background: Gray-800
Text: "Decline"

Friends List Section
Container:
Flex-1 (takes remaining space)
Overflow-y: Auto (scrollable)

Individual Friend Item:
Full width button
Flex row with 0.75rem gap (gap-3)
Items centered
Padding: 1rem (p-4)
Hover background: Gray-800
Transition: Colors
Border bottom: Gray-800

Avatar Container:
Relative positioning for status indicator

Friend Avatar:
Size: 3rem × 3rem (w-12 h-12)
Circular

Status Indicator:
Absolute positioned: bottom-0 right-0
Size: 0.875rem × 0.875rem (w-3.5 h-3.5)
Rounded full (circle)
Border: 2px solid gray-900 (matches dark background)
Colors:
Online: bg-green-500
Away: bg-yellow-500
Offline: bg-gray-400

Friend Info Container:
Flex-1 (takes available space)
Min-width: 0 (for truncation)
Text aligned left

Top Row of Friend Info:
Flex row with space-between
Items centered
Bottom margin: 0.25rem (mb-1)

Friend Username:
Truncated if too long
Color: White

Timestamp (if message exists):
Size: Extra small (text-xs)
Color: Gray-500
Left margin: 0.5rem (ml-2)
Shows relative time (e.g., "2m ago", "1h ago")

Bottom Row of Friend Info:
Flex row with space-between
Items centered

Last Message Preview:
Size: Small (text-sm)
Color: Gray-400
Truncated if too long
Text: Last message or "No messages yet"

Unread Badge (if count > 0):
Left margin: 0.5rem (ml-2)
Background: Emerald-600
Hover: Emerald-700
Minimum width: 1.25rem (min-w-[20px])
Height: 1.25rem (h-5)
Flex container with centered content
Horizontal padding: 0.375rem (px-1.5)
Displays unread count number

---

4. CHAT WINDOW SCREEN

Overall Container
Full height flex column
Background: Gray-900

Header Section
Container:
Flex row with space-between
Items centered
Padding: 1rem (p-4)
Border bottom: Gray-800

Left Section of Header:
Flex row with 0.75rem gap (gap-3)
Items centered

Back Button:
Ghost variant
Icon only
Rounded full
Icon: ArrowLeft, size 1.25rem (w-5 h-5)
Icon color: Emerald-400
Hover text: Emerald-300
Hover background: Gray-800

Friend Avatar Container:
Relative positioning for status dot

Friend Avatar:
Size: 2.5rem × 2.5rem (w-10 h-10)
Circular

Status Dot:
Absolute positioned: bottom-0 right-0
Size: 0.75rem × 0.75rem (w-3 h-3)
Rounded full
Border: 2px solid gray-900
Color based on status (green-500, yellow-500, or gray-400)

Friend Info:
No container, direct children

Friend Name:
Color: White
Default paragraph size

Status Text:
Size: Extra small (text-xs)
Color: Gray-400
Shows: "Active now", "Away", or "Active Xm/h/d ago"

Right Section of Header:
Flex row with 0.25rem gap (gap-1)

More Options Button:
Ghost variant
Icon only
Rounded full
Icon: MoreVertical, size 1.25rem (w-5 h-5)
Color: Gray-400
Hover text: White
Hover background: Gray-800

Dropdown Menu (when opened):
Aligned to end (right side)
Contains "Remove Friend" option with UserMinus icon
Menu item text: Red-600
Icon size: 1rem (w-4 h-4) with 0.5rem right margin (mr-2)

Messages Area
Container:
Flex-1 (takes remaining space)
Overflow-y: Auto (scrollable)
Padding: 1rem (p-4)
Vertical spacing between messages: 1rem (space-y-4)
Background: Gray-950 (darker than header/footer)

Empty State (no messages):
Full height flex column
Items centered horizontally and vertically
Color: Gray-500

Empty State Text:
Line 1: "No messages yet"
Line 2: "Start a conversation with {username}" in small size (text-sm)

Message Bubble Layout:
Flex row with 0.5rem gap (gap-2)
Direction: Reversed for own messages (flex-row-reverse)
Direction: Normal for received messages (flex-row)

Received Message Avatar:
Only shown for received messages (not own)
Size: 2rem × 2rem (w-8 h-8)
Flex-shrink: 0 (doesn't shrink)

Message Content Container:
Flex column
Items alignment: End for own messages, start for received
Max width: 75% of parent (max-w-[75%])

Attachment Display (if exists):
Bottom margin: 0.5rem (mb-2)

Image Attachment:
Rounded: 2xl (rounded-2xl)
Max width: Full (max-w-full)
Height: Auto
Max height: 16rem (max-h-64)
Object fit: Cover

File Attachment:
Padding: 1rem horizontal, 0.75rem vertical (px-4 py-3)
Rounded: 2xl (rounded-2xl)
Background: Emerald-600 for own messages
Background: Gray-800 with gray-700 border for received
Text: White
Shows: 📎 emoji + filename in small size (text-sm)

Text Bubble:
Padding: 1rem horizontal, 0.5rem vertical (px-4 py-2)
Rounded: 2xl (rounded-2xl)
Own messages:
Background: Emerald-600
Text: White
Bottom-right corner: Small radius (rounded-br-sm)
Received messages:
Background: Gray-800
Border: Gray-700 (1px)
Text: White
Bottom-left corner: Small radius (rounded-bl-sm)

Message Text:
Break words: Yes (break-words)
Preserves line breaks

Message Metadata Row:
Flex row with 0.5rem gap (gap-2)
Items centered
Top margin: 0.25rem (mt-1)
Horizontal padding: 0.5rem (px-2)

Timestamp:
Size: Extra small (text-xs)
Color: Gray-500
Format: 12-hour with AM/PM (e.g., "2:30 PM")

Delete Timer Indicator (if exists):
Size: Extra small (text-xs)
Color: Yellow-600
Flex row with items centered and 0.25rem gap (gap-1)
Shows Timer icon (size 0.75rem) + seconds (e.g., "30s")

Read Status (own messages only):
Size: Extra small (text-xs)
Color: Gray-500
Shows: ✓ (sent), ✓✓ (delivered), ✓✓ (read)

Input Area
Container:
Padding: 1rem (p-4)
Border top: Gray-800
Background: Gray-900

Delete Timer Warning (if timer set):
Bottom margin: 0.5rem (mb-2)
Padding: 0.75rem horizontal, 0.5rem vertical (px-3 py-2)
Background: Yellow-900 with 30% opacity (bg-yellow-900/30)
Border: Yellow-700 with 50% opacity (border-yellow-700/50)
Rounded: Large (rounded-lg)
Flex row with space-between
Items centered

Warning Content:
Flex row with 0.5rem gap (gap-2)
Items centered
Size: Small (text-sm)
Color: Yellow-400
Shows Timer icon (1rem size) + text

Cancel Button:
Ghost variant
Size: Small (sm)
Height: 1.5rem (h-6)
Size: Extra small (text-xs)
Color: Yellow-400
Hover: Yellow-300

Input Controls Row:
Flex row with 0.5rem gap (gap-2)
Items aligned to end (bottom)

Attachment Button (Paperclip):
Ghost variant
Icon only
Rounded full
Flex-shrink: 0
Icon: Paperclip, size 1.25rem (w-5 h-5)
Color: Emerald-400
Hover text: Emerald-300
Hover background: Gray-800

Image Button:
Identical to attachment button
Icon: ImageIcon

Timer Button:
Ghost variant
Icon only
Rounded full
Flex-shrink: 0
Icon: Timer, size 1.25rem (w-5 h-5)
Color: Yellow-400 if timer set, Emerald-400 if not
Hover background: Gray-800

Timer Dropdown Menu:
Contains 5 options:
Delete after 10 seconds
Delete after 30 seconds
Delete after 1 minute
Delete after 5 minutes
Don't delete

Message Input Container:
Flex-1 (takes available space)
Relative positioning

Text Input:
Rounded full (pill shape)
Background: Gray-800
Border: Gray-700
Text: White
Placeholder: Gray-500 ("Type a message...")
Right padding: 2.5rem (pr-10) for emoji button

Emoji Button:
Ghost variant
Icon only
Absolute positioned: right-1, top 50%, translateY(-50%)
Rounded full
Size: 2rem × 2rem (h-8 w-8)
Icon: Smile, size 1rem (w-4 h-4)
Color: Gray-400
Hover background: Gray-700

Send Button:
Rounded full
Icon only
Flex-shrink: 0
Background: Emerald-600
Hover: Emerald-700
Disabled opacity: 50% (when no text)
Icon: Send, size 1.25rem (w-5 h-5)
Icon color: White (inherits from button)

Remove Friend Alert Dialog
Dialog Container:
Max width: Calculated as viewport width minus 2rem (max-w-[calc(100%-2rem)])
On larger screens: Max width 32rem (sm:max-w-lg)
Centered on screen
Background: Matches theme background
Rounded: Large (rounded-lg)
Border: 1px solid
Padding: 1.5rem (p-6)
Grid layout with 1rem gap (gap-4)
Box shadow: Large (shadow-lg)

Alert Title:
Text: "Remove {username}?"
Size: Large (text-lg)
Font weight: Semibold

Alert Description:
Text: "Are you sure you want to remove {username} from your friends list? This will delete your conversation history."
Size: Small (text-sm)
Color: Muted foreground

Alert Actions:
Flex row on small screens up
Space between: End justify
Vertical flex column on mobile, reversed
Gap: 0.5rem (gap-2)

Cancel Button:
Variant: Outline
Text: "Cancel"

Remove Button:
Variant: Default
Text: "Remove"
Background: Destructive red

---

5. SETTINGS SCREEN

Overall Container
Full height flex column
Background: Gray-900

Header Section
Container:
Padding: 1rem (p-4)
Border bottom: Gray-800

Title:
Text: "Settings & Profile"
Color: White
Default h2 size

Content Area
Container:
Flex-1 (takes remaining space)
Overflow-y: Auto (scrollable)
Padding: 1rem (p-4)
Vertical spacing: 1.5rem (space-y-6)

Profile Picture Section
Container:
Flex column with centered items
Gap: 1rem (gap-4)
Vertical padding: 1.5rem (py-6)

Avatar Container:
Relative positioning

Avatar:
Size: 6rem × 6rem (w-24 h-24)
Circular

Fallback Text:
Size: 2xl (text-2xl)
Shows first letter of username

Camera Button:
Icon only
Absolute positioned: bottom-0 right-0
Rounded full
Size: 2rem × 2rem (w-8 h-8)
Background: Emerald-600
Hover: Emerald-700
Icon: Camera, size 1rem (w-4 h-4)

User Info:
Text centered

Username:
Color: White
Default paragraph size

Email:
Size: Small (text-sm)
Color: Gray-400

Section Separators
Background: Gray-800
Height: 1px
Full width
Between each major section

Profile Information Section
Header Row:
Flex row with space-between
Items centered

Section Title:
Flex row with 0.5rem gap (gap-2)
Items centered
Color: White
Shows UserIcon (size 1rem) + "Profile Information"

Edit Button (when not editing):
Variant: Outline
Size: Small (sm)
Border: Gray-700
Text: Emerald-400
Hover background: Gray-800
Hover text: Emerald-300
Text: "Edit"

Edit Form (when editing):
Vertical spacing: 1rem (space-y-4)

Form Fields:
Vertical spacing: 0.5rem (space-y-2)

Field Labels:
Color: Gray-300
Associated with inputs

Field Inputs:
Background: Gray-800
Border: Gray-700
Text: White
Full width

Helper Text (under username):
Size: Extra small (text-xs)
Color: Gray-500
Text: "Your unique username"

Form Actions:
Flex row with 0.5rem gap (gap-2)

Save Button:
Flex-1 (equal width)
Background: Emerald-600
Hover: Emerald-700
Text: "Save Changes"

Cancel Button:
Flex-1 (equal width)
Variant: Outline
Border: Gray-700
Text: Gray-300
Hover background: Gray-800
Text: "Cancel"

Info Display (when not editing):
Vertical spacing: 0.75rem (space-y-3)
Background: Gray-800
Rounded: Large (rounded-lg)
Padding: 1rem (p-4)
Border: Gray-700

Info Row:
Flex row with 0.75rem gap (gap-3)
Items centered

Info Icon:
Size: 1rem (w-4 h-4)
Color: Gray-400
Either UserIcon or Mail icon

Info Text Container:
No specific styling

Info Label:
Size: Extra small (text-xs)
Color: Gray-500
Text: "Username" or "Email"

Info Value:
Color: White
Shows actual username or email

Internal Separator:
Background: Gray-700
Between username and email rows

Security Section
Structure:
Identical header layout to Profile Information
Title: "Security" with Lock icon

Change Password Button (when not changing):
Same styling as Edit button
Text: "Change Password"

Password Change Form (when active):
Vertical spacing: 1rem (space-y-4)

Password Fields:
Three fields: Current Password, New Password, Confirm New Password
Same styling as profile edit fields
Type: Password (hidden characters)

Form Actions:
Identical layout to profile form

Update Button:
Text: "Update Password"
Same emerald green styling

Logout Section
Button:
Full width (w-full)
Variant: Destructive (red)
Shows LogOut icon (size 1rem) with 0.5rem right margin (mr-2)
Text: "Logout"

---

6. ADD FRIEND MODAL

Modal Overlay:
Fixed positioning covering full viewport
Background: Black with 50% opacity (bg-black/50)
Z-index: 50

Modal Container:
Fixed positioning
Top: 50%, Left: 50%
Transform: translate(-50%, -50%)
Background: Gray-900
Border: Gray-800
Rounded: Large (rounded-lg)
Max height: 90% of viewport (max-h-[90vh])
Width: Full minus 2rem margin (w-[calc(100%-2rem)])
Max width: 28rem (max-w-md)
Box shadow: Extra large (shadow-xl)
Overflow: Hidden
Z-index: 50

Modal Header:
Flex row with space-between
Items centered
Padding: 1rem (p-4)
Border bottom: Gray-800

Modal Title:
Text: "Add Friend"
Color: White
Default h2 size

Close Button:
Ghost variant
Icon only
Rounded full
Icon: X, size 1.25rem (w-5 h-5)
Color: Gray-400
Hover text: White
Hover background: Gray-800

Modal Content:
Flex-1 or fit-content
Overflow-y: Auto
Padding: 1rem (p-4)
Vertical spacing: 1.5rem (space-y-6)

Search Section:
Vertical spacing: 1rem (space-y-4)

Search Label:
Color: Gray-300
Default label size

Search Input:
Background: Gray-800
Border: Gray-700
Text: White
Placeholder: Gray-500 ("Search by username...")
Full width

Search Button:
Full width
Background: Emerald-600
Hover: Emerald-700
Text: "Send Friend Request"

Pending Requests Section (if any):
Vertical spacing: 1rem (space-y-4)

Section Title:
Color: Gray-300
Shows count: "Pending Requests (X)"

Requests Container:
Vertical spacing: 0.5rem (space-y-2)
Max height: 12rem (max-h-48)
Overflow-y: Auto

Request Card:
Same structure as in FriendsList
Background: Gray-800
Padding: 0.75rem (p-3)
Rounded: Large (rounded-lg)
Border: Gray-700

---

COLOR PALETTE REFERENCE

Primary Mint Green:
emerald-400: #34d399 (logo, icons, accents)
emerald-500: #10b981 (button backgrounds)
emerald-600: #059669 (primary buttons, sent messages)
emerald-700: #047857 (hover states)
emerald-900: #064e3b (dark gradient)
emerald-950: #022c22 (darkest gradient)
teal-900: #134e4a (gradient middle)

Backgrounds:
gray-950: #030712 (app container, darkest)
gray-900: #111827 (main backgrounds)
gray-800: #1f2937 (cards, inputs)

Borders:
gray-800: #1f2937
gray-700: #374151

Text:
White: #ffffff (primary text)
gray-100: #f3f4f6 (light labels)
gray-200: #e5e7eb (lighter labels)
gray-300: #d1d5db (medium labels)
gray-400: #9ca3af (secondary text)
gray-500: #6b7280 (muted text)

Status Colors:
green-500: #22c55e (online)
yellow-400: #facc15 (timer warnings)
yellow-500: #eab308 (away status)
red-600: #dc2626 (destructive actions)

Special:
emerald-200: #a7f3d0 (light mint text on dark backgrounds)
emerald-100: #d1fae5 (very light mint for labels)

---

TYPOGRAPHY SYSTEM

All typography inherits from `/styles/globals.css`:
Default font sizing applied to semantic HTML elements (h1, h2, h3, p)
No Tailwind font-size, font-weight, or line-height classes used unless specifically needed
Text wrapping and overflow handled with break-words and truncate utilities

---

SPACING SYSTEM

Consistent spacing scale used throughout:
0.25rem (gap-1): Tight groupings
0.5rem (gap-2, space-y-2): Close related items
0.75rem (gap-3): Standard component spacing
1rem (gap-4, p-4, space-y-4): Section padding, form fields
1.5rem (space-y-6): Major section separation
2rem (p-8): Large container padding

---

INTERACTIVE STATES

Buttons:
Default: Base color
Hover: Lighter/darker shade + background change
Active: Further color shift
Disabled: 50% opacity
All transitions: Smooth color/background transitions

Inputs:
Focus: Ring appears (browser default)
Hover: No change
Filled: Text color changes from placeholder

List Items:
Hover: Background darkens (gray-800)
Active/Selected: No persistent state (navigation handles this)

---

RESPONSIVE BEHAVIOR

Mobile-first: All layouts optimized for 448px (max-w-md)
Single column throughout
No breakpoint changes in main layouts
Alert dialogs adjust max-width at sm breakpoint
All scrollable areas handle overflow gracefully
Touch-friendly tap targets (minimum 2.5rem for icons)

---

This specification contains every layout detail, spacing value, color choice, component hierarchy, and interactive state needed to recreate the entire messenger application from scratch.