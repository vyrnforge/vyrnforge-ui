import { createContext, createElement, forwardRef, useContext, useState, type ComponentPropsWithoutRef, type ReactNode } from 'react';
interface PasswordFieldContextValue { visible:boolean; disabled:boolean; toggle():void }
const PasswordFieldContext=createContext<PasswordFieldContextValue|null>(null);
function usePasswordField(){const value=useContext(PasswordFieldContext);if(!value)throw new Error('PasswordField parts must be inside root.');return value;}
export interface PasswordFieldRootProps extends ComponentPropsWithoutRef<'div'> {
  visible?:boolean; defaultVisible?:boolean; disabled?:boolean; onVisibleChange?(visible:boolean):void; children?:ReactNode;
}
export const PasswordFieldRoot=forwardRef<HTMLDivElement,PasswordFieldRootProps>(function PasswordFieldRoot(
  {visible,defaultVisible=false,disabled=false,onVisibleChange,children,...props},ref,
){
  const [internal,setInternal]=useState(defaultVisible);
  const current=visible??internal;
  return createElement(PasswordFieldContext.Provider,{value:{visible:current,disabled,toggle(){
    if(disabled)return;
    const next=!current;
    if(visible===undefined)setInternal(next);
    onVisibleChange?.(next);
  }}},createElement('div',{...props,ref,'data-vf-password-field-root':''},children));
});
export const PasswordFieldInput=forwardRef<HTMLInputElement,ComponentPropsWithoutRef<'input'>>(function PasswordFieldInput({disabled,...props},ref){
  const field=usePasswordField();
  return createElement('input',{...props,ref,disabled:field.disabled||disabled,type:field.visible?'text':'password','data-vf-password-field-input':''});
});
export interface PasswordFieldToggleProps extends Omit<ComponentPropsWithoutRef<'button'>,'type'|'aria-pressed'> {
  showLabel:string; hideLabel:string;
}
export const PasswordFieldToggle=forwardRef<HTMLButtonElement,PasswordFieldToggleProps>(function PasswordFieldToggle(
  {showLabel,hideLabel,children,onClick,disabled,...props},ref,
){
  const field=usePasswordField();
  const label=field.visible?hideLabel:showLabel;
  return createElement('button',{...props,ref,type:'button',disabled:field.disabled||disabled,'aria-label':label,'data-vf-password-field-toggle':'',onClick(event){
    onClick?.(event);
    if(!event.defaultPrevented)field.toggle();
  }},children??label);
});
