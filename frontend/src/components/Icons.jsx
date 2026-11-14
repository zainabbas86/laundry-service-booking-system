// Small inline icons used on the auth screens.
const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'currentColor',
  'aria-hidden': true,
};

export const UserIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm0 2c-4.4 0-8 2.2-8 5v2h16v-2c0-2.8-3.6-5-8-5Z" />
  </svg>
);

export const MailIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm9 7.2L20 7H4l8 5.2Z" />
  </svg>
);

export const LockIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M7 10V7a5 5 0 0 1 10 0v3h1a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V11a1 1 0 0 1 1-1h1Zm2 0h6V7a3 3 0 0 0-6 0v3Z" />
  </svg>
);

export const ArrowRightIcon = (props) => (
  <svg {...base} width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2} {...props}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
