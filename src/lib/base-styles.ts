import { css } from "./styled.tsx";

export const base = css`
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  html,
  body,
  #root {
    margin: 0;
    padding: 0;
    min-height: 100%;
  }

  html {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    scroll-behavior: smooth;
  }

  body {
    font-family: "Inter", system-ui, -apple-system, "Segoe UI", sans-serif;
    color: #0f172a;
    background: #fffdf7;
    line-height: 1.6;
    font-size: 16px;
  }

  h1,
  h2,
  h3,
  h4 {
    font-family: "Fraunces", Georgia, serif;
    font-weight: 600;
    line-height: 1.15;
    margin: 0;
    letter-spacing: -0.01em;
  }

  h1 {
    font-size: clamp(2.2rem, 5vw, 3.4rem);
    font-weight: 600;
  }
  h2 {
    font-size: clamp(1.7rem, 3.5vw, 2.4rem);
  }
  h3 {
    font-size: clamp(1.3rem, 2.5vw, 1.6rem);
  }

  p {
    margin: 0;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  button {
    font-family: inherit;
    cursor: pointer;
    border: none;
    background: none;
  }

  input,
  textarea,
  select {
    font-family: inherit;
    font-size: inherit;
  }

  ::selection {
    background: rgba(13, 148, 136, 0.2);
  }

  :focus-visible {
    outline: 2px solid #0d9488;
    outline-offset: 2px;
    border-radius: 4px;
  }

  @keyframes fadeUp {
    from {
      opacity: 0;
      transform: translateY(12px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes pop {
    0% {
      opacity: 0;
      transform: scale(0.96);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes pulse {
    0%,
    100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.4);
      opacity: 0.5;
    }
  }

  @keyframes shimmer {
    0% {
      background-position: -800px 0;
    }
    100% {
      background-position: 800px 0;
    }
  }
`;
