import React from "react";

// Properties for icons
type IconProps = {
    className?: string;
}

// Workflow icon
export const WorkflowIcon = (props: IconProps) => (
    <svg className={props.className} width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 0C1.17157 0 0.5 0.671573 0.5 1.5V3.5C0.5 4.32843 1.17157 5 2 5H2.5V8.84068C2.42593 8.88348 2.35618 8.93656 2.29282 8.99992L0.499925 10.7928C0.109399 11.1833 0.109401 11.8165 0.499925 12.207L2.29282 13.9999C2.68334 14.3904 3.31651 14.3904 3.70703 13.9999L5.49993 12.207C5.56325 12.1437 5.6163 12.074 5.65909 12H9.5V12.5C9.5 13.3284 10.1716 14 11 14H13C13.8284 14 14.5 13.3284 14.5 12.5V10.5C14.5 9.67157 13.8284 9 13 9H11C10.1716 9 9.5 9.67157 9.5 10.5V11H5.65917C5.61637 10.9259 5.56329 10.8562 5.49992 10.7928L3.70703 8.99992C3.64371 8.9366 3.57401 8.88355 3.5 8.84076V5H4C4.82843 5 5.5 4.32843 5.5 3.5V1.5C5.5 0.671573 4.82843 0 4 0H2ZM1.5 1.5C1.5 1.22386 1.72386 1 2 1H4C4.27614 1 4.5 1.22386 4.5 1.5V3.5C4.5 3.77614 4.27614 4 4 4H2C1.72386 4 1.5 3.77614 1.5 3.5V1.5ZM1.20703 11.4999L2.99992 9.70703L4.79282 11.4999L2.99992 13.2928L1.20703 11.4999ZM11 10H13C13.2761 10 13.5 10.2239 13.5 10.5V12.5C13.5 12.7761 13.2761 13 13 13H11C10.7239 13 10.5 12.7761 10.5 12.5V10.5C10.5 10.2239 10.7239 10 11 10Z" fill="#242424"/>
    </svg>
);

// Agent icon
export const AgentIcon = (props: IconProps) => (
    <svg className={props.className} width="16" height="20" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13.7534 11.9999C14.9961 11.9999 16.0034 13.0073 16.0034 14.2499V15.155C16.0034 16.2487 15.526 17.2879 14.6961 18.0003C13.1307 19.3442 10.8904 20.0011 8.00036 20.0011C5.11087 20.0011 2.87205 19.3445 1.30918 18.0008C0.480561 17.2884 0.00390625 16.25 0.00390625 15.1572V14.2499C0.00390625 13.0073 1.01127 11.9999 2.25391 11.9999H13.7534ZM13.7534 13.4999H2.25391C1.83969 13.4999 1.50391 13.8357 1.50391 14.2499V15.1572C1.50391 15.8129 1.7899 16.4359 2.28707 16.8634C3.54516 17.945 5.44117 18.5011 8.00036 18.5011C10.5603 18.5011 12.4582 17.9447 13.7191 16.8622C14.2169 16.4347 14.5034 15.8112 14.5034 15.155V14.2499C14.5034 13.8357 14.1676 13.4999 13.7534 13.4999ZM7.89893 0.00733495L8.0007 0.000488281C8.38039 0.000488281 8.69419 0.282642 8.74385 0.648718L8.7507 0.750488L8.74991 1.49949L12.2504 1.49999C13.493 1.49999 14.5004 2.50735 14.5004 3.74999V8.25459C14.5004 9.49723 13.493 10.5046 12.2504 10.5046H3.75036C2.50772 10.5046 1.50036 9.49723 1.50036 8.25459V3.74999C1.50036 2.50735 2.50772 1.49999 3.75036 1.49999L7.24991 1.49949L7.2507 0.750488C7.2507 0.370793 7.53285 0.0569974 7.89893 0.00733495L8.0007 0.000488281L7.89893 0.00733495ZM12.2504 2.99999H3.75036C3.33615 2.99999 3.00036 3.33578 3.00036 3.74999V8.25459C3.00036 8.6688 3.33615 9.00459 3.75036 9.00459H12.2504C12.6646 9.00459 13.0004 8.6688 13.0004 8.25459V3.74999C13.0004 3.33578 12.6646 2.99999 12.2504 2.99999ZM5.74965 4.49999C6.43962 4.49999 6.99894 5.05932 6.99894 5.74928C6.99894 6.43925 6.43962 6.99857 5.74965 6.99857C5.05969 6.99857 4.50036 6.43925 4.50036 5.74928C4.50036 5.05932 5.05969 4.49999 5.74965 4.49999ZM10.2424 4.49999C10.9324 4.49999 11.4917 5.05932 11.4917 5.74928C11.4917 6.43925 10.9324 6.99857 10.2424 6.99857C9.55243 6.99857 8.9931 6.43925 8.9931 5.74928C8.9931 5.05932 9.55243 4.49999 10.2424 4.49999Z" fill="black"/>
    </svg>
);

// Model icon
export const ModelIcon = (props: IconProps) => (
<svg className={props.className} width="16" height="15" viewBox="0 0 16 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 14.9999C1.2203 14.9999 0.579551 14.4051 0.506867 13.6444L0.5 13.4999V2.49994C0.5 1.72024 1.09489 1.07949 1.85554 1.00681L2 0.999939H6.5C7.2797 0.999939 7.92045 1.59483 7.99313 2.35548L8 2.49994V2.75437L10.1886 0.485117C10.7276 -0.0740709 11.5959 -0.124381 12.1956 0.347004L12.3118 0.448241L15.0694 3.17289C15.6219 3.71878 15.6614 4.58763 15.18 5.18407L15.0767 5.29955L12.766 7.49937L13 7.49994C13.7797 7.49994 14.4204 8.09483 14.4931 8.85548L14.5 8.99994V13.4999C14.5 14.2796 13.9051 14.9204 13.1445 14.9931L13 14.9999H2ZM7 8.49994H1.5V13.4999C1.5 13.7147 1.63542 13.8979 1.82553 13.9687L1.91012 13.9919L2 13.9999H7V8.49994ZM13 8.49994H8V13.9999H13C13.2455 13.9999 13.4496 13.8231 13.4919 13.5898L13.5 13.4999V8.99994C13.5 8.75448 13.3231 8.55033 13.0899 8.50799L13 8.49994ZM8 5.70937V7.49937H9.79L8 5.70937ZM6.5 1.99994H2C1.75454 1.99994 1.55039 2.17681 1.50806 2.41006L1.5 2.49994V7.49994H7V2.49994C7 2.28516 6.86458 2.10201 6.67447 2.03122L6.58988 2.008L6.5 1.99994ZM11.6222 1.17259C11.4396 0.99646 11.1692 0.981493 10.9768 1.11998L10.9086 1.17909L8.29255 3.89323C8.12705 4.06494 8.10856 4.32495 8.23563 4.51638L8.299 4.59377L10.9147 7.20949C11.0826 7.3774 11.3409 7.40129 11.5345 7.27924L11.6131 7.218L14.3708 4.59133C14.5433 4.41673 14.561 4.14719 14.4248 3.95313L14.3665 3.88423L11.6222 1.17259Z" fill="#242424"/>
</svg>
);

// Skill icon
export const SkillIcon = (props: IconProps) => (
    <svg className={props.className} width="13" height="16" viewBox="0 0 13 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5.2 5C4.26112 5 3.5 5.76112 3.5 6.7C3.5 7.41797 4.08203 8 4.8 8H8.2C8.91797 8 9.5 7.41797 9.5 6.7C9.5 5.76112 8.73888 5 7.8 5H5.2ZM4.5 6.7C4.5 6.3134 4.8134 6 5.2 6H7.8C8.1866 6 8.5 6.3134 8.5 6.7C8.5 6.86569 8.36569 7 8.2 7H4.8C4.63431 7 4.5 6.86569 4.5 6.7ZM6.5 0C5.11929 0 4 1.11929 4 2.5V2.54404C1.93447 3.49205 0.5 5.57851 0.5 8V13C0.5 14.6569 1.84315 16 3.5 16H9.5C11.1569 16 12.5 14.6569 12.5 13V8C12.5 5.57851 11.0655 3.49205 9 2.54404V2.5C9 1.11929 7.88071 0 6.5 0ZM11.5 10H1.5V8C1.5 5.23858 3.73858 3 6.5 3C9.26142 3 11.5 5.23858 11.5 8V10ZM3.5 12.5C3.5 12.7761 3.72386 13 4 13C4.27614 13 4.5 12.7761 4.5 12.5V11H11.5V13C11.5 14.1046 10.6046 15 9.5 15H3.5C2.39543 15 1.5 14.1046 1.5 13V11H3.5V12.5ZM6.5 2C5.99433 2 5.50327 2.06255 5.03413 2.18035C5.18061 1.50549 5.78127 1 6.5 1C7.21873 1 7.81939 1.50549 7.96587 2.18035C7.49673 2.06255 7.00567 2 6.5 2Z" fill="#242424"/>
    </svg>
);

// Build icon
export const BuildIcon = (props: IconProps) => (
    <svg width="20" height="18" viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3.5C11.4477 3.5 11 3.94772 11 4.5C11 5.05228 11.4477 5.5 12 5.5C12.5523 5.5 13 5.05228 13 4.5C13 3.94772 12.5523 3.5 12 3.5ZM7 4.5C7 3.94772 7.44772 3.5 8 3.5C8.55228 3.5 9 3.94772 9 4.5C9 5.05228 8.55228 5.5 8 5.5C7.44772 5.5 7 5.05228 7 4.5ZM10.5 0.5C10.5 0.223858 10.2761 0 10 0C9.72386 0 9.5 0.223858 9.5 0.5V1H6.5C5.67157 1 5 1.67157 5 2.5V6.5C5 7.32843 5.67157 8 6.5 8H12.7944L13.1196 7H6.5C6.22386 7 6 6.77614 6 6.5V2.5C6 2.22386 6.22386 2 6.5 2H13.5C13.7761 2 14 2.22386 14 2.5V6.08285C14.1527 6.02834 14.3145 6 14.4786 6C14.658 6 14.8348 6.03392 15 6.09893V2.5C15 1.67157 14.3284 1 13.5 1H10.5V0.5ZM8.5 9.5H10.4081C10.3549 9.55409 10.3059 9.6126 10.2617 9.67508C10.0915 9.91543 10 10.2027 10 10.4973L10 10.5031H5.3093C4.86233 10.5031 4.5 10.8654 4.5 11.3124V11.75C4.5 12.4396 4.63123 13.2064 5.30224 13.8187C5.98969 14.446 7.33946 15 10 15C11.5502 15 12.6553 14.8119 13.4438 14.5309C13.4944 14.5869 13.5495 14.6389 13.6088 14.6865C13.6311 14.7044 13.6542 14.7219 13.6782 14.7388C13.8135 14.8345 13.9637 14.9052 14.1216 14.9488C14.0573 15.0869 14.0176 15.2354 14.0047 15.3878C13.089 15.7549 11.8677 15.9777 10.25 15.9984V16H9.75V15.9984C7.13442 15.9649 5.55506 15.4031 4.6282 14.5574C3.75297 13.7588 3.53931 12.7813 3.50533 12.0019H3.5V11.3124C3.5 10.3131 4.31005 9.5031 5.3093 9.5031H8.5V9.5ZM14.8777 7.28225L15.226 8.35305C15.3343 8.67859 15.5171 8.97441 15.7599 9.21699C16.0026 9.45957 16.2987 9.64223 16.6245 9.75044L17.6961 10.0985L17.7175 10.1038C17.8001 10.1329 17.8716 10.1869 17.9222 10.2584C17.9728 10.3298 18 10.4152 18 10.5027C18 10.5902 17.9728 10.6756 17.9222 10.747C17.8716 10.8184 17.8001 10.8724 17.7175 10.9016L16.6459 11.2496C16.3201 11.3578 16.0241 11.5404 15.7813 11.783C15.5385 12.0256 15.3558 12.3214 15.2475 12.647L14.8992 13.7178C14.87 13.8003 14.816 13.8718 14.7445 13.9223C14.673 13.9729 14.5876 14 14.5 14C14.4124 14 14.327 13.9729 14.2555 13.9223C14.2484 13.9173 14.2416 13.9121 14.2349 13.9067C14.1736 13.8575 14.1271 13.7921 14.1008 13.7178L13.7525 12.647C13.7338 12.5901 13.7128 12.5342 13.6897 12.4793C13.5796 12.2187 13.4202 11.9812 13.2197 11.78C13.1815 11.7417 13.1421 11.705 13.1014 11.6697C12.883 11.4806 12.6292 11.3359 12.3541 11.2442L11.2825 10.8962C11.1999 10.8671 11.1284 10.8131 11.0778 10.7416C11.0272 10.6702 11 10.5848 11 10.4973C11 10.4098 11.0272 10.3244 11.0778 10.253C11.1284 10.1816 11.1999 10.1276 11.2825 10.0985L12.3541 9.75044C12.6759 9.63941 12.9677 9.45549 13.2066 9.21307C13.4454 8.97065 13.625 8.67631 13.7311 8.35305L14.0794 7.28225C14.1085 7.19972 14.1626 7.12825 14.2341 7.0777C14.3056 7.02715 14.391 7 14.4786 7C14.5662 7 14.6516 7.02715 14.7231 7.0777C14.7946 7.12825 14.8486 7.19972 14.8777 7.28225ZM19.7829 15.2132L19.0175 14.9646C18.7848 14.8873 18.5733 14.7568 18.3999 14.5836C18.2265 14.4103 18.0959 14.199 18.0186 13.9665L17.7698 13.2016C17.749 13.1427 17.7104 13.0916 17.6593 13.0555C17.6083 13.0194 17.5473 13 17.4847 13C17.4221 13 17.3611 13.0194 17.31 13.0555C17.259 13.0916 17.2204 13.1427 17.1996 13.2016L16.9508 13.9665C16.875 14.1974 16.7467 14.4076 16.5761 14.5808C16.4055 14.7539 16.1971 14.8853 15.9672 14.9646L15.2018 15.2132C15.1428 15.234 15.0917 15.2726 15.0555 15.3236C15.0194 15.3746 15 15.4356 15 15.4981C15 15.5606 15.0194 15.6216 15.0555 15.6726C15.0917 15.7236 15.1428 15.7622 15.2018 15.783L15.9672 16.0316C16.2003 16.1093 16.412 16.2403 16.5855 16.4143C16.7589 16.5882 16.8893 16.8003 16.9661 17.0335L17.2149 17.7984C17.2357 17.8574 17.2743 17.9084 17.3254 17.9445C17.3764 17.9806 17.4374 18 17.5 18C17.5626 18 17.6236 17.9806 17.6746 17.9445C17.7257 17.9084 17.7643 17.8574 17.7851 17.7984L18.0339 17.0335C18.1113 16.801 18.2418 16.5897 18.4152 16.4164C18.5886 16.2432 18.8001 16.1127 19.0328 16.0354L19.7982 15.7868C19.8572 15.766 19.9083 15.7275 19.9445 15.6764C19.9806 15.6254 20 15.5644 20 15.5019C20 15.4394 19.9806 15.3784 19.9445 15.3274C19.9083 15.2764 19.8572 15.2378 19.7982 15.217L19.7829 15.2132ZM13.6088 14.6865L13.6782 14.7388L13.6088 14.6865Z" fill="#000" />
    </svg>
);

// Playground icon
export const PlaygroundIcon = (props: IconProps) => (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3.5 0C1.567 0 0 1.567 0 3.5C0 5.433 1.567 7 3.5 7H6.5C6.77614 7 7 6.77614 7 6.5V3.5C7 1.567 5.433 0 3.5 0ZM1 3.5C1 2.11929 2.11929 1 3.5 1C4.88071 1 6 2.11929 6 3.5V6H3.5C2.11929 6 1 4.88071 1 3.5ZM3.5 15C1.567 15 0 13.433 0 11.5C0 9.567 1.567 8 3.5 8H6.5C6.77614 8 7 8.22386 7 8.5V11.5C7 13.433 5.433 15 3.5 15ZM1 11.5C1 12.8807 2.11929 14 3.5 14C4.88071 14 6 12.8807 6 11.5V9H3.5C2.11929 9 1 10.1193 1 11.5ZM15 3.5C15 1.567 13.433 0 11.5 0C9.567 0 8 1.567 8 3.5V6.5C8 6.77614 8.22386 7 8.5 7H11.5C13.433 7 15 5.433 15 3.5ZM11.5 1C12.8807 1 14 2.11929 14 3.5C14 4.88071 12.8807 6 11.5 6H9V3.5C9 2.11929 10.1193 1 11.5 1ZM11.5 15C13.433 15 15 13.433 15 11.5C15 9.567 13.433 8 11.5 8H8.5C8.22386 8 8 8.22386 8 8.5V11.5C8 13.433 9.567 15 11.5 15ZM14 11.5C14 12.8807 12.8807 14 11.5 14C10.1193 14 9 12.8807 9 11.5V9H11.5C12.8807 9 14 10.1193 14 11.5Z" fill="black"/>
    </svg>
);

export const CollapseMenuIcon = (props: IconProps) => (
    <svg width="20" height="16" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2.5 14C2.22386 14 2 13.7761 2 13.5L2 2.5C2 2.22386 2.22386 2 2.5 2C2.77614 2 3 2.22386 3 2.5L3 13.5C3 13.7761 2.77614 14 2.5 14ZM18 8C18 8.27614 17.7761 8.5 17.5 8.5L6.70711 8.5L9.85355 11.6464C10.0488 11.8417 10.0488 12.1583 9.85355 12.3536C9.65829 12.5488 9.34171 12.5488 9.14645 12.3536L5.14645 8.35355C5.09851 8.30562 5.06234 8.25037 5.03794 8.19139C5.01385 8.13331 5.0004 8.0697 5.00001 8.003L5 8L5.00001 7.997C5.00077 7.87004 5.04958 7.74332 5.14645 7.64645L9.14645 3.64645C9.34171 3.45119 9.65829 3.45119 9.85355 3.64645C10.0488 3.84171 10.0488 4.15829 9.85355 4.35355L6.70711 7.5L17.5 7.5C17.7761 7.5 18 7.72386 18 8Z" fill="#242424"/>
    </svg>
);

export const ExpandMenuIcon = (props: IconProps) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.5 4C17.7761 4 18 4.22386 18 4.5V15.5C18 15.7761 17.7761 16 17.5 16C17.2239 16 17 15.7761 17 15.5V4.5C17 4.22386 17.2239 4 17.5 4ZM2 10C2 9.72386 2.22386 9.5 2.5 9.5H13.2929L10.1464 6.35355C9.95118 6.15829 9.95118 5.84171 10.1464 5.64645C10.3417 5.45118 10.6583 5.45118 10.8536 5.64645L14.8536 9.64645C14.9015 9.69439 14.9377 9.74964 14.9621 9.80861C14.9861 9.86669 14.9996 9.9303 15 9.997L15 10L15 10.003C14.9992 10.13 14.9504 10.2567 14.8536 10.3536L10.8536 14.3536C10.6583 14.5488 10.3417 14.5488 10.1464 14.3536C9.95118 14.1583 9.95118 13.8417 10.1464 13.6464L13.2929 10.5H2.5C2.22386 10.5 2 10.2761 2 10Z" fill="#242424"/>
    </svg>
);