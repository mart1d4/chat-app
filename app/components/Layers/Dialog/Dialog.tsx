"use client";

import { LoadingDots } from "@components";
import styles from "./Dialog.module.css";
import {
    FloatingFocusManager,
    useTransitionStyles,
    useInteractions,
    FloatingOverlay,
    FloatingPortal,
    useMergeRefs,
    useFloating,
    useDismiss,
    useClick,
    useRole,
    useId,
} from "@floating-ui/react";
import {
    useLayoutEffect,
    isValidElement,
    createContext,
    cloneElement,
    forwardRef,
    useContext,
    useState,
    useMemo,
} from "react";

const headingIcons = {
    stamp: {
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 220 154"
                width="180"
                fill="none"
            >
                <g clipPath="url(#clip0_640_6902)">
                    <path
                        d="M129.112 122.613H129.104L125.683 123.711L34.5769 152.865L31.6156 153.815H31.6078L0 91.1763L83.3991 64.4858L86.5474 63.4805H86.5552L97.5042 59.9738L110.643 86.0175L111.477 87.6695L113.16 90.9971L114.391 93.4363L129.112 122.613Z"
                        fill="url(#paint0_linear_640_6902)"
                    />
                    <path
                        d="M129.104 122.613L125.683 123.712L86.9605 113.3L77.1883 110.659L76.9 110.588L70.3774 108.835L69.7695 108.671L64.6184 107.284L62.0858 111.118L61.7818 111.586L58.4465 116.675L58.3608 116.807L53.0539 124.857L34.577 152.865L31.6157 153.815L51.1836 124.14L56.7243 115.732L56.7866 115.638L60.6285 109.817L60.7064 109.7L62.8962 106.372L63.3794 105.64C63.4877 105.463 63.6496 105.325 63.8417 105.247C64.0337 105.168 64.2458 105.153 64.447 105.204L66.7849 105.843L69.7383 106.622H69.8085L77.3364 108.648L77.6481 108.734L87.5216 111.438L129.104 122.613Z"
                        fill="#B9BBBE"
                    />
                    <path
                        d="M86.5552 63.4806L83.4381 64.4858L0 91.1764L43.0867 101.588L50.8328 103.458L51.7056 103.668L59.2257 105.484H59.3659L62.9117 106.341L66.0288 107.121L66.8627 105.874L68.2966 103.645L71.8033 98.3925L72.154 97.8704L76.4011 91.5192L86.0954 77.0167L88.3787 73.6035L97.5042 60.0049L86.5552 63.4806Z"
                        fill="#E3E5E8"
                    />
                    <path
                        d="M144.877 80.2664C144.877 80.2664 105.726 93.5688 102.016 94.8156C99.7952 95.5949 98.3146 95.8521 97.2937 95.5949C96.9559 95.531 96.6382 95.3874 96.3671 95.1759C96.096 94.9645 95.8793 94.6913 95.7351 94.3792C95.1974 93.3584 83.5237 72.341 82.7133 70.7591C81.7158 68.8109 83.8666 66.473 86.8357 63.1844C87.9657 61.9376 112.552 55.3137 112.552 55.3137L138.627 75.388L144.877 80.2664Z"
                        fill="#ED5F00"
                    />
                    <path
                        d="M144.877 80.2664C144.877 80.2664 105.726 93.5688 102.016 94.8156C99.7953 95.5949 98.3146 95.8521 97.2938 95.5949C95.517 94.2623 99.5693 90.2412 99.5693 90.2412L138.619 75.3881L144.877 80.2664Z"
                        fill="black"
                    />
                    <path
                        d="M148.797 78.3805C148.518 79.1725 148.141 79.9264 147.674 80.6248C146.425 82.4765 144.584 83.85 142.453 84.5212L141.05 84.9421C126.174 89.8126 110.051 94.6519 106.294 96.1248C105.433 96.4908 104.51 96.6917 103.575 96.7171C102.786 96.7176 102.016 96.4837 101.361 96.0452C100.706 95.6068 100.196 94.9834 99.8964 94.2545C99.2029 92.9375 83.5315 64.8365 82.534 62.7636C81.1235 59.8335 86.1654 54.0824 88.1916 53.2719C90.2177 52.4614 124.226 42.6425 124.226 42.6425C124.226 42.6425 144.487 66.3171 148.999 74.9984C149.37 76.1097 149.298 77.3214 148.797 78.3805Z"
                        fill="#FFC619"
                    />
                    <path
                        d="M46.7572 114.321C46.7572 114.321 45.7052 120.018 50.3575 123.618C53.4746 126.042 59.2569 125.364 63.6054 123.548C66.0871 122.47 68.3107 120.876 70.128 118.872C73.4212 119.271 76.7592 119.081 79.9859 118.311C84.4123 117.15 86.8514 114.415 87.3813 111.898C88.5113 106.497 83.3369 102.593 83.3369 102.593C83.3369 102.593 85.55 96.6703 80.9367 92.9531C77.4844 90.1788 71.7801 92.1738 71.7801 92.1738C71.7801 92.1738 67.1823 90.5373 63.13 91.8153C58.5556 93.2492 56.8957 96.2651 56.8957 96.2651C56.8957 96.2651 48.7678 96.4053 44.4271 100.052C41.2477 102.718 41.045 107.245 42.5491 110.253C43.7803 112.669 46.7572 114.321 46.7572 114.321Z"
                        fill="#808AFF"
                    />
                    <path
                        d="M78.7079 104.884C78.9495 104.261 77.3597 100.395 76.1519 100.442C75.3144 100.511 74.4864 100.668 73.6815 100.91C73.6815 100.91 72.3567 98.3302 70.9073 97.7925C69.8864 97.4418 66.855 97.8548 60.7766 99.5381C54.6981 101.221 52.5863 102.312 51.9784 103.045C50.7783 104.494 52.4304 107.393 52.4304 107.393C52.4304 107.393 49.7263 108.095 49.4769 109.342C49.3133 110.175 50.8796 114.267 52.181 114.243C53.1755 114.102 54.149 113.841 55.08 113.464C55.08 113.464 56.6385 116.464 58.579 116.815C60.2622 117.111 63.8937 116.168 68.7097 114.609C73.5257 113.051 76.7441 111.274 77.2818 109.864C77.7806 108.609 76.3389 106.146 76.3389 106.146C76.3389 106.146 78.4741 105.546 78.7079 104.884Z"
                        fill="#5865F2"
                    />
                    <path
                        d="M148.797 78.3805C148.518 79.1725 148.141 79.9265 147.675 80.6249C146.425 82.4766 144.584 83.8501 142.453 84.5213L141.051 84.9421C126.174 89.8126 110.051 94.652 106.295 96.1249C105.433 96.4908 104.511 96.6917 103.575 96.7171C102.577 96.4366 103.294 94.3793 104.113 93.0155C104.931 91.6518 107.027 89.1191 109.256 88.4021C121.576 84.2641 141.207 77.7493 149.054 75.1543C149.342 76.2272 149.251 77.3668 148.797 78.3805Z"
                        fill="black"
                    />
                    <path
                        d="M69.8473 108.578C69.068 109.747 63.1844 111.695 62.0544 111.134C60.9245 110.573 58.3684 106.521 59.0931 105.679C59.8179 104.837 66.8392 102.78 67.6029 103.014C68.3666 103.248 70.5954 107.417 69.8473 108.578Z"
                        fill="#808AFF"
                    />
                    <path
                        d="M217.693 66.5354C209.409 58.875 196.808 48.4715 196.808 48.4715L189.366 29.683L183.023 32.1767L186.093 29.9245C186.093 29.9245 185.602 9.66313 177.35 4.55102C172.619 1.62091 168.559 0.927346 162.543 0.264954L154.462 43.4296L142.492 48.1442L135.144 62.7714C135.144 62.7714 139.274 70.2214 145.048 75.3725C150.823 80.5235 157.992 79.152 162.598 79.0741C162.598 79.0741 173.087 88.9866 181.823 95.9768C185.493 98.9224 190.301 98.486 194.174 96.7015C203.464 92.4232 212.62 84.42 215.558 81.2249C221.52 74.749 220.616 69.2317 217.693 66.5354Z"
                        fill="url(#paint1_linear_640_6902)"
                    />
                    <path
                        d="M169.884 46.6948C169.64 46.6962 169.405 46.6062 169.224 46.4425C169.044 46.2789 168.931 46.0534 168.908 45.8107C168.886 45.5679 168.955 45.3256 169.103 45.1315C169.25 44.9373 169.465 44.8056 169.705 44.7622L185.758 41.8009C185.884 41.7779 186.013 41.7798 186.138 41.8067C186.263 41.8336 186.382 41.8849 186.487 41.9576C186.593 42.0304 186.683 42.1231 186.752 42.2306C186.821 42.3381 186.869 42.4582 186.892 42.5841C186.915 42.7099 186.913 42.8391 186.886 42.9642C186.859 43.0893 186.808 43.2079 186.735 43.3132C186.663 43.4185 186.57 43.5084 186.462 43.5779C186.355 43.6473 186.235 43.6949 186.109 43.7179L170.056 46.6792L169.884 46.6948Z"
                        fill="#D11583"
                    />
                    <path
                        d="M168.053 20.542C167.827 20.5444 167.608 20.4678 167.433 20.3255C167.258 20.1832 167.138 19.9841 167.094 19.7627C167.094 19.6926 165.832 12.7959 165.216 10.4113C165.153 10.1602 165.192 9.89429 165.325 9.67215C165.458 9.45001 165.674 9.2898 165.925 9.22677C166.176 9.16373 166.442 9.20303 166.664 9.33602C166.887 9.46901 167.047 9.6848 167.11 9.93592C167.733 12.414 168.957 19.1627 169.011 19.451C169.057 19.7041 169 19.9649 168.854 20.1765C168.708 20.3882 168.485 20.5336 168.232 20.581L168.053 20.542Z"
                        fill="#D11583"
                    />
                    <path
                        d="M187.761 5.73553C193.629 1.94821 201.64 1.34816 206.799 9.1488C211.958 16.9494 210.064 23.4331 203.409 27.6724C199.029 30.4545 134.505 66.6367 125.995 70.2759C121.046 72.3722 116.417 71.9826 113.526 67.2757C110.23 61.8752 110.729 57.4489 115.607 53.9655C119.535 51.1679 179.236 11.2607 187.761 5.73553Z"
                        fill="#FFE75C"
                    />
                    <path
                        d="M167.687 26.8152C167.572 29.1647 166.709 31.4158 165.222 33.2389C163.736 35.0619 161.705 36.361 159.426 36.9459L160.572 39.0266C164.803 48.7911 165.746 50.3808 160.299 54.7915C159.52 55.4384 156.808 57.0125 154.906 58.1658C153.769 58.8516 152.514 59.5686 151.22 60.2232C149.862 60.9414 148.449 61.5537 146.997 62.0545C139.726 64.4781 129.026 67.9147 119.589 49.7963C115.848 42.6113 117.384 37.959 120.852 33.5326C125.192 27.9919 135.658 19.2094 138.518 17.0897C139.118 16.6377 140.334 10.8555 142.757 6.79538C145.181 2.7353 148.843 -1.04423 162.535 0.27276C162.535 0.27276 167.99 19.2484 167.687 26.8152Z"
                        fill="url(#paint2_linear_640_6902)"
                    />
                    <path
                        d="M154.096 39.3461C153.946 39.3474 153.798 39.3143 153.663 39.2495C153.528 39.1846 153.409 39.0897 153.317 38.9721C153.075 38.6604 147.363 31.2961 143.256 18.9756C143.185 18.7337 143.211 18.4739 143.328 18.2508C143.445 18.0276 143.644 17.8584 143.883 17.7787C144.122 17.6991 144.383 17.7151 144.61 17.8235C144.838 17.9319 145.014 18.1242 145.103 18.36C149.101 30.3376 154.789 37.694 154.852 37.772C154.931 37.8725 154.989 37.9877 155.023 38.1109C155.057 38.2341 155.067 38.3628 155.051 38.4896C155.035 38.6165 154.994 38.7389 154.93 38.8498C154.867 38.9607 154.782 39.0579 154.68 39.1357C154.514 39.2688 154.309 39.3428 154.096 39.3461Z"
                        fill="#D11583"
                    />
                    <path
                        d="M154.906 58.1503C153.769 58.836 152.514 59.553 151.22 60.2076C146.95 59.6699 143.739 56.9969 141.51 54.7526C134.879 48.1209 129.821 34.9276 129.58 34.3743C129.534 34.2545 129.513 34.127 129.516 33.999C129.52 33.8709 129.549 33.7449 129.601 33.628C129.654 33.5111 129.729 33.4057 129.822 33.3178C129.915 33.2299 130.025 33.1613 130.145 33.1157C130.264 33.0702 130.392 33.0487 130.52 33.0524C130.648 33.0562 130.774 33.0851 130.891 33.1376C131.008 33.19 131.113 33.265 131.201 33.3582C131.289 33.4514 131.358 33.561 131.403 33.6807C131.45 33.8132 136.554 47.0454 142.89 53.381C146.981 57.4801 150.706 58.9607 154.906 58.1503Z"
                        fill="#D11583"
                    />
                    <path
                        d="M151.696 42.1749C154.298 47.3728 166.299 45.2921 177.505 43.2737C183.085 42.2762 187.2 41.5203 187.2 41.5203L199.107 51.7757C201.344 47.7234 206.9 36.4706 204.103 30.735C196.31 14.8922 190.317 12.9907 183.701 14.9389C176.898 16.9651 164.11 22.911 155.6 28.366C148.391 32.9872 148.68 36.1277 151.696 42.1749Z"
                        fill="#FF78B9"
                    />
                    <path
                        d="M36.1588 46.6246C34.6742 45.6804 33.4125 44.4247 32.4612 42.9446C31.5099 41.4644 30.8916 39.7952 30.6493 38.0525L29.7297 32.091C29.7133 31.9443 29.6441 31.8085 29.5349 31.7091C29.4297 31.613 29.2951 31.5554 29.153 31.5455C29.0062 31.5549 28.8665 31.6124 28.7556 31.7091C28.6515 31.8113 28.5855 31.9461 28.5686 32.091L27.649 38.0525C27.3957 39.7918 26.773 41.4567 25.8226 42.9353C24.8723 44.4139 23.6165 45.6718 22.1395 46.6246L21.3602 47.1312C21.2761 47.1842 21.2086 47.2598 21.1654 47.3494C21.1245 47.4373 21.1033 47.533 21.103 47.6299C21.1042 47.7267 21.1254 47.8222 21.1654 47.9105C21.2108 47.9985 21.2778 48.0736 21.3602 48.1287L22.1395 48.6274C23.6113 49.5835 24.8647 50.8396 25.8177 52.3134C26.7686 53.7877 27.393 55.4484 27.649 57.1839L28.5686 63.1221C28.5758 63.1918 28.5967 63.2593 28.6301 63.3208C28.6635 63.3824 28.7089 63.4367 28.7634 63.4806C28.8698 63.5767 29.0098 63.6271 29.153 63.6208C29.2938 63.6259 29.4309 63.5755 29.5349 63.4806C29.5894 63.4367 29.6347 63.3824 29.6682 63.3208C29.7016 63.2593 29.7225 63.1918 29.7297 63.1221L30.6493 57.1606C30.8937 55.4185 31.5127 53.7501 32.4639 52.2702C33.415 50.7904 34.6756 49.5343 36.1588 48.5884L36.9381 48.0897C37.0205 48.0346 37.0875 47.9596 37.1329 47.8715C37.1728 47.7833 37.1941 47.6878 37.1953 47.591C37.195 47.494 37.1737 47.3983 37.1329 47.3104C37.0897 47.2208 37.0222 47.1452 36.9381 47.0922L36.1588 46.6246Z"
                        fill="#91FFAD"
                    />
                    <path
                        d="M156.706 138.385C155.341 137.511 154.18 136.352 153.301 134.989C152.423 133.625 151.849 132.089 151.618 130.484L150.768 124.974C150.754 124.839 150.69 124.714 150.589 124.623C150.492 124.53 150.365 124.475 150.231 124.467C150.097 124.476 149.97 124.531 149.872 124.623C149.771 124.714 149.707 124.839 149.693 124.974L148.843 130.484C148.605 132.087 148.028 133.62 147.151 134.983C146.273 136.345 145.115 137.505 143.755 138.385L143.022 138.845C142.951 138.899 142.892 138.969 142.851 139.048C142.807 139.129 142.786 139.221 142.788 139.313C142.786 139.403 142.807 139.491 142.851 139.57C142.89 139.651 142.949 139.72 143.022 139.773L143.755 140.232C145.116 141.113 146.274 142.274 147.152 143.638C148.026 145.004 148.602 146.539 148.843 148.142L149.693 153.652C149.712 153.781 149.776 153.899 149.872 153.987C149.974 154.068 150.1 154.112 150.231 154.112C150.361 154.112 150.487 154.068 150.589 153.987C150.688 153.901 150.752 153.782 150.768 153.652L151.618 148.142C151.853 146.542 152.429 145.012 153.307 143.654C154.185 142.296 155.344 141.142 156.706 140.271L157.439 139.812C157.514 139.76 157.576 139.69 157.618 139.609C157.656 139.529 157.674 139.441 157.673 139.352C157.674 139.261 157.655 139.17 157.618 139.087C157.574 139.007 157.512 138.938 157.439 138.884L156.706 138.385Z"
                        fill="#66BCFF"
                    />
                    <path
                        d="M65.5847 24.5708C64.8001 24.06 64.1333 23.3879 63.6287 22.5993C63.1232 21.8169 62.7935 20.9342 62.6623 20.012L62.1714 16.8403C62.1622 16.7631 62.1264 16.6915 62.0701 16.6377C62.0122 16.5903 61.9418 16.5605 61.8675 16.552C61.7904 16.559 61.7171 16.5889 61.6571 16.6377C61.6008 16.6915 61.565 16.7631 61.5558 16.8403L61.0648 20.012C60.9294 20.9343 60.5972 21.8167 60.0907 22.5993C59.5872 23.3819 58.9231 24.0486 58.1425 24.5553L57.7217 24.8202C57.6779 24.8492 57.6429 24.8896 57.6204 24.9371C57.5998 24.9838 57.5891 25.0342 57.5891 25.0852C57.5891 25.1362 57.5998 25.1866 57.6204 25.2332C57.6429 25.2807 57.6779 25.3211 57.7217 25.3501L58.1425 25.6151C58.9231 26.1217 59.5872 26.7885 60.0907 27.5711C60.5972 28.3537 60.9294 29.236 61.0648 30.1583L61.5636 33.3456C61.5732 33.4205 61.6091 33.4895 61.6649 33.5404C61.7253 33.5865 61.7993 33.6111 61.8753 33.6106C61.95 33.6129 62.0229 33.5869 62.0793 33.5378C62.1357 33.4886 62.1714 33.42 62.1792 33.3456L62.6701 30.1739C62.8013 29.2517 63.131 28.369 63.6365 27.5867C64.1428 26.8037 64.8095 26.137 65.5925 25.6307L66.0211 25.3657C66.0605 25.3341 66.0924 25.2942 66.1146 25.2488C66.1398 25.2036 66.1531 25.1526 66.1531 25.1008C66.1531 25.0489 66.1398 24.998 66.1146 24.9527C66.0924 24.9073 66.0605 24.8674 66.0211 24.8358L65.5847 24.5708Z"
                        fill="#3442D9"
                    />
                    <path
                        d="M178.254 117.836C177.512 117.358 176.88 116.729 176.399 115.989C175.923 115.245 175.612 114.408 175.487 113.534L175.028 110.542C175.018 110.467 174.982 110.398 174.926 110.347C174.874 110.297 174.804 110.269 174.731 110.269C174.658 110.271 174.588 110.299 174.535 110.35C174.482 110.4 174.449 110.469 174.443 110.542L173.983 113.534C173.853 114.406 173.54 115.24 173.064 115.981C172.584 116.721 171.955 117.352 171.217 117.836L170.819 118.085C170.774 118.109 170.739 118.147 170.718 118.194C170.697 118.238 170.687 118.286 170.687 118.334C170.687 118.383 170.697 118.431 170.718 118.475C170.739 118.521 170.774 118.56 170.819 118.584L171.217 118.841C171.957 119.318 172.587 119.948 173.064 120.689C173.542 121.429 173.855 122.263 173.983 123.135L174.443 126.127C174.453 126.198 174.486 126.264 174.537 126.314C174.593 126.357 174.661 126.381 174.731 126.384C174.802 126.383 174.871 126.358 174.926 126.314C174.982 126.267 175.018 126.2 175.028 126.127L175.487 123.135C175.614 122.261 175.925 121.425 176.399 120.68C176.878 119.941 177.511 119.314 178.254 118.841L178.651 118.584C178.694 118.559 178.727 118.521 178.745 118.475C178.765 118.431 178.775 118.383 178.775 118.334C178.775 118.286 178.765 118.238 178.745 118.194C178.727 118.148 178.694 118.11 178.651 118.085L178.254 117.836Z"
                        fill="#FFE75C"
                    />
                </g>
                <defs>
                    <linearGradient
                        id="paint0_linear_640_6902"
                        x1="76.2141"
                        y1="135.666"
                        x2="53.2096"
                        y2="78.887"
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop stopColor="#E3E5E8" />
                        <stop
                            offset="1"
                            stopColor="#B9BBBE"
                        />
                    </linearGradient>
                    <linearGradient
                        id="paint1_linear_640_6902"
                        x1="164.234"
                        y1="43.6633"
                        x2="210.828"
                        y2="100.793"
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop
                            offset="0.43"
                            stopColor="#FF78B9"
                        />
                        <stop
                            offset="0.5"
                            stopColor="#FB6FB4"
                        />
                        <stop
                            offset="0.78"
                            stopColor="#EF50A5"
                        />
                        <stop
                            offset="0.94"
                            stopColor="#EB459F"
                        />
                    </linearGradient>
                    <linearGradient
                        id="paint2_linear_640_6902"
                        x1="136.32"
                        y1="17.869"
                        x2="166.744"
                        y2="65.0781"
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop
                            offset="0.18"
                            stopColor="#FF78B9"
                        />
                        <stop
                            offset="0.29"
                            stopColor="#FB6FB4"
                        />
                        <stop
                            offset="0.71"
                            stopColor="#EF50A5"
                        />
                        <stop
                            offset="0.95"
                            stopColor="#EB459F"
                        />
                    </linearGradient>
                    <clipPath id="clip0_640_6902">
                        <rect
                            width="220"
                            height="154"
                            fill="white"
                        />
                    </clipPath>
                </defs>
            </svg>
        ),
        width: 180,
        top: -68,
        left: 140,
    },
};

interface DialogContentProps {
    heading?: string;
    headingIcon?: keyof typeof headingIcons;
    boldHeading?: boolean;
    description?: string;
    centered?: boolean;
    contentCentered?: boolean;
    hideClose?: boolean;
    hideCancel?: boolean;
    confirmLabel?: string;
    buttonFull?: boolean;
    confirmLoading?: boolean;
    confirmColor?: string;
    closeOnConfirm?: boolean;
    art?: string;
    artFullUrl?: boolean;
    blank?: boolean;
    onCancel?: () => void;
    onConfirm?: () => void;
}

interface DialogOptions {
    initialOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function useDialog({
    initialOpen = false,
    open: controlledOpen,
    onOpenChange: setControlledOpen,
}: DialogOptions = {}) {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(initialOpen);
    const [labelId, setLabelId] = useState<string | undefined>();
    const [descriptionId, setDescriptionId] = useState<string | undefined>();

    const open = controlledOpen ?? uncontrolledOpen;
    const setOpen = setControlledOpen ?? setUncontrolledOpen;

    const data = useFloating({
        open,
        onOpenChange: setOpen,
    });

    const context = data.context;

    const click = useClick(context, {
        enabled: controlledOpen == null,
    });
    const dismiss = useDismiss(context, { outsidePressEvent: "click" });
    const role = useRole(context);

    const interactions = useInteractions([click, dismiss, role]);

    return useMemo(
        () => ({
            open,
            setOpen,
            ...interactions,
            ...data,
            labelId,
            descriptionId,
            setLabelId,
            setDescriptionId,
        }),
        [open, setOpen, interactions, data, labelId, descriptionId]
    );
}

type ContextType =
    | (ReturnType<typeof useDialog> & {
          setLabelId: React.Dispatch<React.SetStateAction<string | undefined>>;
          setDescriptionId: React.Dispatch<React.SetStateAction<string | undefined>>;
      })
    | null;

const DialogContext = createContext<ContextType>(null);

export const useDialogContext = () => {
    const context = useContext(DialogContext);

    if (context == null) {
        throw new Error("Dialog components must be wrapped in <Dialog />");
    }

    return context;
};

export function Dialog({
    children,
    ...options
}: {
    children: React.ReactNode;
} & DialogOptions) {
    const dialog = useDialog(options);
    return <DialogContext.Provider value={dialog}>{children}</DialogContext.Provider>;
}

interface DialogTriggerProps {
    children: React.ReactNode;
    asChild?: boolean;
}

export const DialogTrigger = forwardRef<
    HTMLElement,
    React.HTMLProps<HTMLElement> & DialogTriggerProps
>(function DialogTrigger({ children, asChild = true, ...props }, propRef) {
    const context = useDialogContext();
    const childrenRef = (children as any).ref;
    const ref = useMergeRefs([context.refs.setReference, propRef, childrenRef]);

    // `asChild` allows the user to pass any element as the anchor
    if (asChild && isValidElement(children)) {
        return cloneElement(
            children,
            context.getReferenceProps({
                ref,
                ...props,
                ...(children.props as any),
                "data-state": context.open ? "open" : "closed",
            })
        );
    }

    return (
        <button
            ref={ref}
            data-state={context.open ? "open" : "closed"}
            {...context.getReferenceProps(props)}
        >
            {children}
        </button>
    );
});

export const DialogContent = forwardRef<
    HTMLDivElement,
    React.HTMLProps<HTMLDivElement> & DialogContentProps
>(function DialogContent(props: React.HTMLProps<HTMLDivElement> & DialogContentProps, propRef) {
    const { context: floatingContext, ...context } = useDialogContext();
    const ref = useMergeRefs([context.refs.setFloating, propRef]);

    const { isMounted } = useTransitionStyles(floatingContext, {
        duration: 300,
    });

    if (!isMounted) return null;

    if (props.blank) {
        return (
            <FloatingPortal>
                <FloatingOverlay
                    className={styles.overlay}
                    style={{ animationName: !floatingContext.open ? styles.fadeOut : "" }}
                    lockScroll
                >
                    <FloatingFocusManager context={floatingContext}>
                        <div
                            ref={ref}
                            aria-labelledby={context.labelId}
                            aria-describedby={context.descriptionId}
                            {...context.getFloatingProps(
                                // @ts-ignore - props but need to remove all the props that are not valid on a div
                                ({
                                    blank,
                                    onConfirm,
                                    art,
                                    artFullUrl,
                                    boldHeading,
                                    heading,
                                    headingIcon,
                                    description,
                                    centered,
                                    contentCentered,
                                    hideClose,
                                    hideCancel,
                                    confirmLabel,
                                    buttonFull,
                                    confirmLoading,
                                    closeOnConfirm,
                                    confirmColor,
                                    onCancel,
                                    ...props
                                }: any) => props
                            )}
                        >
                            {props.children}
                        </div>
                    </FloatingFocusManager>
                </FloatingOverlay>
            </FloatingPortal>
        );
    }

    return (
        <FloatingPortal>
            <FloatingOverlay
                className={styles.overlay}
                style={{ animationName: !floatingContext.open ? styles.fadeOut : "" }}
                lockScroll
            >
                <FloatingFocusManager context={floatingContext}>
                    <div
                        ref={ref}
                        aria-labelledby={context.labelId}
                        aria-describedby={context.descriptionId}
                        {...context.getFloatingProps(
                            // @ts-ignore - props but need to remove all the props that are not valid on a div
                            ({
                                blank,
                                onConfirm,
                                art,
                                artFullUrl,
                                boldHeading,
                                heading,
                                headingIcon,
                                description,
                                centered,
                                contentCentered,
                                hideClose,
                                hideCancel,
                                confirmLabel,
                                buttonFull,
                                confirmLoading,
                                closeOnConfirm,
                                confirmColor,
                                onCancel,
                                ...props
                            }: any) => props
                        )}
                    >
                        <div
                            style={{
                                animationName: !floatingContext.open ? styles.popOut : "",
                            }}
                            className={styles.dialog}
                        >
                            {props.headingIcon && (
                                <div
                                    className={styles.icon}
                                    style={{
                                        top: `${headingIcons[props.headingIcon].top}px`,
                                        left: `${headingIcons[props.headingIcon].left}px`,
                                    }}
                                >
                                    {headingIcons[props.headingIcon].icon}
                                </div>
                            )}

                            <header
                                className={`${styles.header} ${
                                    props.centered ? styles.centered : ""
                                } ${props.headingIcon ? styles.withIcon : ""} ${
                                    props.boldHeading ? styles.boldHeading : ""
                                }`}
                            >
                                {props.art && (
                                    <img
                                        alt={props.art}
                                        draggable={false}
                                        className={styles.art}
                                        src={
                                            props.artFullUrl
                                                ? props.art
                                                : `/assets/system/${props.art}`
                                        }
                                    />
                                )}

                                <DialogHeading>{props.heading}</DialogHeading>

                                {props.description && (
                                    <DialogDescription>{props.description}</DialogDescription>
                                )}

                                {props.centered && !props.hideClose && (
                                    <DialogClose>
                                        <button
                                            className={styles.close}
                                            onClick={() => {
                                                if (props.onCancel) {
                                                    props.onCancel();
                                                }
                                            }}
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                height="22"
                                                width="22"
                                            >
                                                <path
                                                    fill="currentColor"
                                                    d="M18.4 4L12 10.4L5.6 4L4 5.6L10.4 12L4 18.4L5.6 20L12 13.6L18.4 20L20 18.4L13.6 12L20 5.6L18.4 4Z"
                                                />
                                            </svg>
                                        </button>
                                    </DialogClose>
                                )}
                            </header>

                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();

                                    if (props.onConfirm) {
                                        props.onConfirm();
                                    }

                                    if (props.closeOnConfirm) {
                                        context.setOpen(false);
                                    }
                                }}
                            >
                                <main
                                    className={`${styles.content} ${
                                        props.contentCentered ? styles.centered : ""
                                    }`}
                                >
                                    {props.children}
                                </main>

                                <footer className={styles.footer}>
                                    <button
                                        type="submit"
                                        className={`button ${props.confirmColor || "blue"}`}
                                    >
                                        {props.confirmLoading ? (
                                            <LoadingDots />
                                        ) : (
                                            props.confirmLabel || "Confirm"
                                        )}
                                    </button>

                                    {!props.buttonFull && !props.hideCancel && (
                                        <button
                                            type="button"
                                            className="button underline"
                                            onClick={() => {
                                                context.setOpen(false);
                                                if (props.onCancel) {
                                                    props.onCancel();
                                                }
                                            }}
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </footer>
                            </form>
                        </div>
                    </div>
                </FloatingFocusManager>
            </FloatingOverlay>
        </FloatingPortal>
    );
});

export const DialogHeading = forwardRef<HTMLHeadingElement, React.HTMLProps<HTMLHeadingElement>>(
    function DialogHeading({ children, ...props }, ref) {
        const { setLabelId } = useDialogContext();
        const id = useId();

        // Only sets `aria-labelledby` on the Dialog root element
        // if this component is mounted inside it.
        useLayoutEffect(() => {
            setLabelId(id);
            return () => setLabelId(undefined);
        }, [id, setLabelId]);

        return (
            <h2
                {...props}
                ref={ref}
                id={id}
            >
                {children}
            </h2>
        );
    }
);

export const DialogDescription = forwardRef<
    HTMLParagraphElement,
    React.HTMLProps<HTMLParagraphElement>
>(function DialogDescription({ children, ...props }, ref) {
    const { setDescriptionId } = useDialogContext();
    const id = useId();

    // Only sets `aria-describedby` on the Dialog root element
    // if this component is mounted inside it.
    useLayoutEffect(() => {
        setDescriptionId(id);
        return () => setDescriptionId(undefined);
    }, [id, setDescriptionId]);

    return (
        <p
            {...props}
            ref={ref}
            id={id}
        >
            {children}
        </p>
    );
});

export const DialogProtip = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className={styles.protip}>
            <p>Protip:</p>
            <p>{children}</p>
        </div>
    );
};

export const DialogClose = forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(function DialogClose(props, ref) {
    const context = useDialogContext();
    const setOpen = context.setOpen;

    if (isValidElement(props.children)) {
        return cloneElement(
            props.children,
            context.getReferenceProps({
                ref,
                ...props,
                ...(props.children.props as any),
                "data-state": context.open ? "open" : "closed",
            })
        );
    }

    return (
        <button
            type="button"
            {...props}
            ref={ref}
            onClick={() => setOpen(false)}
        />
    );
});
