import type { CustomThemeConfig } from '@skeletonlabs/tw-plugin'

export const myCustomTheme: CustomThemeConfig = {
  name: 'my-custom-theme',
  properties: {
    // =~= Theme Properties =~=
    '--theme-font-family-base': `system-ui`,
    '--theme-font-family-heading': `system-ui`,
    '--theme-font-color-base': '0 0 0',
    '--theme-font-color-dark': '255 255 255',
    '--theme-rounded-base': '8px',
    '--theme-rounded-container': '4px',
    '--theme-border-base': '1px',
    // =~= Theme On-X Colors =~=
    '--on-primary': '255 255 255',
    '--on-secondary': '255 255 255',
    '--on-tertiary': '255 255 255',
    '--on-success': '0 0 0',
    '--on-warning': '0 0 0',
    '--on-error': '0 0 0',
    '--on-surface': '0 0 0',
    // =~= Theme Colors  =~=
    // primary | #3f94e4
    '--color-primary-50': '226 239 251', // #e2effb
    '--color-primary-100': '217 234 250', // #d9eafa
    '--color-primary-200': '207 228 248', // #cfe4f8
    '--color-primary-300': '178 212 244', // #b2d4f4
    '--color-primary-400': '121 180 236', // #79b4ec
    '--color-primary-500': '63 148 228', // #3f94e4
    '--color-primary-600': '57 133 205', // #3985cd
    '--color-primary-700': '47 111 171', // #2f6fab
    '--color-primary-800': '38 89 137', // #265989
    '--color-primary-900': '31 73 112', // #1f4970
    // secondary | #6670b7
    '--color-secondary-50': '232 234 244', // #e8eaf4
    '--color-secondary-100': '224 226 241', // #e0e2f1
    '--color-secondary-200': '217 219 237', // #d9dbed
    '--color-secondary-300': '194 198 226', // #c2c6e2
    '--color-secondary-400': '148 155 205', // #949bcd
    '--color-secondary-500': '102 112 183', // #6670b7
    '--color-secondary-600': '92 101 165', // #5c65a5
    '--color-secondary-700': '77 84 137', // #4d5489
    '--color-secondary-800': '61 67 110', // #3d436e
    '--color-secondary-900': '50 55 90', // #32375a
    // tertiary | #b9847e
    '--color-tertiary-50': '245 237 236', // #f5edec
    '--color-tertiary-100': '241 230 229', // #f1e6e5
    '--color-tertiary-200': '238 224 223', // #eee0df
    '--color-tertiary-300': '227 206 203', // #e3cecb
    '--color-tertiary-400': '206 169 165', // #cea9a5
    '--color-tertiary-500': '185 132 126', // #b9847e
    '--color-tertiary-600': '167 119 113', // #a77771
    '--color-tertiary-700': '139 99 95', // #8b635f
    '--color-tertiary-800': '111 79 76', // #6f4f4c
    '--color-tertiary-900': '91 65 62', // #5b413e
    // success | #60e27a
    '--color-success-50': '231 251 235', // #e7fbeb
    '--color-success-100': '223 249 228', // #dff9e4
    '--color-success-200': '215 248 222', // #d7f8de
    '--color-success-300': '191 243 202', // #bff3ca
    '--color-success-400': '144 235 162', // #90eba2
    '--color-success-500': '96 226 122', // #60e27a
    '--color-success-600': '86 203 110', // #56cb6e
    '--color-success-700': '72 170 92', // #48aa5c
    '--color-success-800': '58 136 73', // #3a8849
    '--color-success-900': '47 111 60', // #2f6f3c
    // warning | #e2ca32
    '--color-warning-50': '251 247 224', // #fbf7e0
    '--color-warning-100': '249 244 214', // #f9f4d6
    '--color-warning-200': '248 242 204', // #f8f2cc
    '--color-warning-300': '243 234 173', // #f3eaad
    '--color-warning-400': '235 218 112', // #ebda70
    '--color-warning-500': '226 202 50', // #e2ca32
    '--color-warning-600': '203 182 45', // #cbb62d
    '--color-warning-700': '170 152 38', // #aa9826
    '--color-warning-800': '136 121 30', // #88791e
    '--color-warning-900': '111 99 25', // #6f6319
    // error | #fe5d5d
    '--color-error-50': '255 231 231', // #ffe7e7
    '--color-error-100': '255 223 223', // #ffdfdf
    '--color-error-200': '255 215 215', // #ffd7d7
    '--color-error-300': '255 190 190', // #ffbebe
    '--color-error-400': '254 142 142', // #fe8e8e
    '--color-error-500': '254 93 93', // #fe5d5d
    '--color-error-600': '229 84 84', // #e55454
    '--color-error-700': '191 70 70', // #bf4646
    '--color-error-800': '152 56 56', // #983838
    '--color-error-900': '124 46 46', // #7c2e2e
    // surface | #d4d4d4
    '--color-surface-50': '249 249 249', // #f9f9f9
    '--color-surface-100': '246 246 246', // #f6f6f6
    '--color-surface-200': '244 244 244', // #f4f4f4
    '--color-surface-300': '238 238 238', // #eeeeee
    '--color-surface-400': '225 225 225', // #e1e1e1
    '--color-surface-500': '212 212 212', // #d4d4d4
    '--color-surface-600': '191 191 191', // #bfbfbf
    '--color-surface-700': '159 159 159', // #9f9f9f
    '--color-surface-800': '127 127 127', // #7f7f7f
    '--color-surface-900': '104 104 104', // #686868
  },
}
