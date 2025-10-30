# BookIt: Experiences & Slots

## Live Deployment

Both frontend and backend are deployed on **Vercel**:

* **Frontend (Next.js):** [https://bookit-frontend.vercel.app](https://bookit-frontend.vercel.app)
* **Backend (Express.js):** [https://bookit-backend.vercel.app](https://bookit-backend.vercel.app)

## Features

* Responsive and mobile-friendly UI matching Figma design.
* Home Page: Browse all experiences fetched from backend.
* Details Page: View experience details, images, and available slots.
* Checkout Page: Fill booking form, apply promo code, and view price summary.
* Result Page: Show booking success or failure message.
* Promo Code Validation: Supports discount codes like SAVE10, FLAT100.
* Double Booking Prevention: Ensures slot availability before confirmation.
* Data stored in MongoDB with proper validation.
* Error handling on both frontend and backend.
* Loading, success, and failure states for smooth user experience.
* API integration using Axios.
* Clean and modern design using TailwindCSS.
* Fully hosted on **Vercel** (Next.js frontend + Express.js backend).
