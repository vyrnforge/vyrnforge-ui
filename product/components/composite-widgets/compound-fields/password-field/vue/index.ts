import { computed, defineComponent, h, inject, provide, ref, type InjectionKey, type Ref } from 'vue';
interface PasswordFieldContextValue { visible:Ref<boolean>; disabled:Ref<boolean>; toggle():void }
const passwordFieldKey:InjectionKey<PasswordFieldContextValue>=Symbol('password-field');
function usePasswordField(){const value=inject(passwordFieldKey);if(!value)throw new Error('PasswordField parts must be inside root.');return value;}
function invoke(handler:unknown,event:Event):void {if(typeof handler==='function')handler(event);else if(Array.isArray(handler))for(const fn of handler)if(typeof fn==='function')fn(event);}
export const PasswordFieldRoot=defineComponent({
  name:'PasswordFieldRoot',inheritAttrs:false,
  props:{visible:{type:Boolean,default:undefined},defaultVisible:Boolean,disabled:Boolean},
  emits:['update:visible'],
  setup(props,{attrs,slots,emit}){
    const internal=ref(props.defaultVisible);
    const visible=computed(()=>props.visible??internal.value);
    const disabled=computed(()=>props.disabled);
    provide(passwordFieldKey,{visible,disabled,toggle(){if(disabled.value)return;const next=!visible.value;if(props.visible===undefined)internal.value=next;emit('update:visible',next);}});
    return ()=>h('div',{...attrs,'data-vf-password-field-root':''},slots.default?.());
  }
});
export const PasswordFieldInput=defineComponent({
  name:'PasswordFieldInput',inheritAttrs:false,props:{disabled:Boolean},
  setup(props,{attrs}){const field=usePasswordField();return ()=>h('input',{...attrs,disabled:field.disabled.value||props.disabled,type:field.visible.value?'text':'password','data-vf-password-field-input':''});}
});
export const PasswordFieldToggle=defineComponent({
  name:'PasswordFieldToggle',inheritAttrs:false,props:{showLabel:{type:String,required:true},hideLabel:{type:String,required:true},disabled:Boolean},
  setup(props,{attrs,slots}){
    const field=usePasswordField();
    return ()=>{
      const label=field.visible.value?props.hideLabel:props.showLabel;
      return h('button',{...attrs,type:'button',disabled:field.disabled.value||props.disabled,'aria-label':label,'aria-pressed':undefined,'data-vf-password-field-toggle':'',onClick(event:MouseEvent){
        invoke(attrs.onClick,event);
        if(!event.defaultPrevented)field.toggle();
      }},slots.default?.()??label);
    };
  }
});
