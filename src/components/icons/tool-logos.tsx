import type { SVGProps } from 'react';

export const MySQLIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    <path d="M14.2 9.2L12 12l-2.2-2.8" />
    <path d="M12 12v3" />
  </svg>
);

export const StataIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M4 4h16v4H4z" />
    <path d="M4 10h16" />
    <path d="M10 10v10" />
    <path d="M6 14h8" />
    <path d="M6 18h8" />
  </svg>
);

export const AnacondaPythonIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M10.5 8.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
    <path d="M13.5 15.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
    <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
    <path d="m3.5 12 5-5" />
    <path d="M15.5 17 19 13.5" />
  </svg>
);

export const JupyterIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M4 9a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" />
    <path d="M12 7V3" />
    <path d="M18 7V3" />
    <path d="M6 7V3" />
    <path d="M12 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
  </svg>
);

export const ToolLogos = {
  MySQL: MySQLIcon,
  Stata: StataIcon,
  Anaconda: AnacondaPythonIcon,
  Jupyter: JupyterIcon,
};
