export enum ButtonTypeEnum {
    POSITIVE = 1,
    CANCEL = 0,
    NEGATIVE = -1
}

export const ButtonType = {
    POSITIVE: 1,
    CANCEL: 0,
    NEGATIVE: -1
};

export interface DialogButton {
    text: string;
    buttonType: ButtonTypeEnum;
    collapseTime?: number;
    textColor?: string;
    backgroundColor?: string;
}

export interface DialogResult<T> {
    buttonType: ButtonTypeEnum;
    value?: T
}

export const createDialogResult = (type: ButtonTypeEnum, value?: any) => ({
    buttonType: type,
    value
});