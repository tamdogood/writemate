# WriteMate

WriteMate is a writing coach application that provides LLM-powered feedback to help users improve their writing skills. It analyzes user-submitted text and provides feedback on grammar, spelling, clarity, and more.

## Tech Stack

### Frontend

*   **Framework:** [Next.js](https://nextjs.org/) (React)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **UI Components:** [Radix UI](https://www.radix-ui.com/)
*   **Rich Text Editor:** [Tiptap](https://tiptap.dev/)
*   **Authentication & Database:** [Supabase](https://supabase.io/)
*   **Charts:** [Recharts](https://recharts.org/)

### Backend

*   **Framework:** [FastAPI](https://fastapi.tiangolo.com/)
*   **Language:** [Python](https://www.python.org/)
*   **Server:** [Uvicorn](https://www.uvicorn.org/)
*   **LLM Integration:** [OpenAI](https://openai.com/)
*   **Database:** [Supabase](https://supabase.io/)
*   **Data Validation:** [Pydantic](https://pydantic-docs.helpmanual.io/)

## Database Schema

The database schema is designed to store user sessions, documents, feedback, and other relevant data. For a detailed view of the schema, please refer to the [database schema documentation](./docs/01-database-schema.md).

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

*   Node.js and npm (for the frontend)
*   Python and pip (for the backend)

### Installation

1.  **Clone the repo**
    ```sh
    git clone https://github.com/tamdogood/writemate.git
    cd writemate
    ```

2.  **Set up the frontend**
    ```sh
    cd frontend
    npm install
    cp .env.example .env
    ```
    Update the `.env` file with your Supabase credentials.

3.  **Set up the backend**
    ```sh
    cd ../backend
    pip install -r requirements.txt
    cp .env.example .env
    ```
    Update the `.env` file with your OpenAI and Supabase credentials.

### Running the Application

1.  **Run the backend server**
    ```sh
    cd backend
    uvicorn app.main:app --reload
    ```

2.  **Run the frontend development server**
    ```sh
    cd ../frontend
    npm run dev
    ```

The application should now be running at `http://localhost:3000`.
