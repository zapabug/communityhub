// CSS modules declaration
declare module '*.css' {
    const content: { [className: string]: string };
    export default content;
}

// Allow Tailwind CSS directives in CSS files
declare namespace CSS {
    interface AtRule {
        tailwind: any;
    }
} 