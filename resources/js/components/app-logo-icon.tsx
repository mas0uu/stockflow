import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg
            {...props}
            viewBox="0 0 32 32"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <path
                d="m16 2 13 7.5v13L16 30 3 22.5v-13L16 2Zm0 3.5L7.5 10.4 16 15.3l8.5-4.9L16 5.5ZM6 13v7.8l8.5 4.9v-7.8L6 13Zm20 0-8.5 4.9v7.8l8.5-4.9V13Z"
                fill="currentColor"
            />
        </svg>
    );
}
