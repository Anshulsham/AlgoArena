# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

├── backend
│   ├── src
│   │   ├── config
│   │   │   ├── db.js
│   │   │   └── redis.js
│   │   ├── controllers
│   │   │   ├── dailyProblemController.js
│   │   │   ├── discussionController.js
│   │   │   ├── solveDoubt.js
│   │   │   ├── userAuthent.js
│   │   │   ├── userProblem.js
│   │   │   ├── userSubmission.js
│   │   │   └── videoSection.js
│   │   ├── middleware
│   │   │   ├── adminMiddleware.js
│   │   │   ├── rateLimiter.js
│   │   │   └── userMiddleware.js
│   │   ├── models
│   │   │   ├── Comment.js
│   │   │   ├── DailyProblem.js
│   │   │   ├── Discussion.js
│   │   │   ├── problem.js
│   │   │   ├── solutionVideo.js
│   │   │   ├── submission.js
│   │   │   └── user.js
│   │   ├── utils
│   │   │   ├── problemUtility.js
│   │   │   └── validator.js
│   │   └── index.js
│   ├── package-lock.json
│   └── package.json
├── DeploySheet
│   └── datapart.md
├── frontend
│   ├── public
│   │   └── vite.svg
│   ├── src
│   │   ├── assets
│   │   │   └── react.svg
│   │   ├── components
│   │   │   ├── AdminDelete.jsx
│   │   │   ├── AdminPanel.jsx
│   │   │   ├── AdminUpload.jsx
│   │   │   ├── AdminVideo.jsx
│   │   │   ├── ChatAi.jsx
│   │   │   ├── Editorial.jsx
│   │   │   ├── StreakCalendar.jsx
│   │   │   └── SubmissionHistory.jsx
│   │   ├── pages
│   │   │   ├── Admin.jsx
│   │   │   ├── DiscussionDetail.jsx
│   │   │   ├── DiscussionList.jsx
│   │   │   ├── GuidePage.jsx
│   │   │   ├── Homepage.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── POTDPage.jsx
│   │   │   ├── ProblemPage.jsx
│   │   │   ├── Signup.jsx
│   │   │   └── UserProfile.jsx
│   │   ├── store
│   │   │   └── store.js
│   │   ├── utils
│   │   │   └── axiosClient.js
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── authSlice.js
│   │   ├── index.css
│   │   ├── main.jsx
│   │   └── submissionSlice.js
│   ├── eslint.config.js
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── README.md
│   └── vite.config.js
