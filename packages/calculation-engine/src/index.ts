/** S05 bounded expression interpreter, version 1. No executable pack code. */
export type Value=number|boolean|string;
export type Expr={op:"literal";value:Value}|{op:"ref";key:string}|{op:"if";args:[Expr,Expr,Expr]}|{op:string;args:Expr[]};
const arity:Record<string,number>={add:2,sub:2,mul:2,div:2,min:2,max:2,floor:1,ceil:1,round:1,eq:2,lt:2,lte:2,and:2,or:2,not:1,if:3,clamp:3};
export function validateExpression(raw:unknown):Expr{
 let count=0;const active=new Set<object>();
 function visit(x:unknown,depth:number):void{
 if(++count>1024||depth>32||!x||typeof x!=="object"||Array.isArray(x))throw Error("INVALID_EXPRESSION");
 if(active.has(x))throw Error("EXPRESSION_CYCLE");active.add(x);
 const e=x as Record<string,unknown>;const op=e.op;
 if(op==="literal"){if(!["number","boolean","string"].includes(typeof e.value)||(typeof e.value==="number"&&!Number.isFinite(e.value)))throw Error("INVALID_LITERAL");}
 else if(op==="ref"){if(typeof e.key!=="string"||!/^[a-zA-Z0-9._:-]{1,128}$/.test(e.key))throw Error("INVALID_REFERENCE");}
 else{if(typeof op!=="string"||!Object.hasOwn(arity,op)||!Array.isArray(e.args)||e.args.length!==arity[op])throw Error("INVALID_OPERATOR");for(const a of e.args)visit(a,depth+1);}
 active.delete(x);
 }visit(raw,0);return raw as Expr;
}
export function evaluateExpression(raw:unknown,inputs:Readonly<Record<string,Value>>):Value{
 const expr=validateExpression(raw);
 function num(v:Value):number{if(typeof v!=="number"||!Number.isFinite(v))throw Error("EXPECTED_NUMBER");return v;}
 function bool(v:Value):boolean{if(typeof v!=="boolean")throw Error("EXPECTED_BOOLEAN");return v;}
 function run(e:Expr):Value{
 if("value" in e)return e.value;
 if("key" in e){if(!Object.hasOwn(inputs,e.key))throw Error("UNRESOLVED_REFERENCE");const v=inputs[e.key];if(v===undefined||!["number","boolean","string"].includes(typeof v)||(typeof v==="number"&&!Number.isFinite(v)))throw Error("INVALID_INPUT");return v;}
 const at=(i:number)=>{const a=e.args[i];if(!a)throw Error("INVALID_ARITY");return run(a);};
 if(e.op==="if")return bool(at(0))?at(1):at(2);
 if(e.op==="and")return bool(at(0))&&bool(at(1));
 if(e.op==="or")return bool(at(0))||bool(at(1));
 if(e.op==="not")return !bool(at(0));
 if(e.op==="eq")return at(0)===at(1);
 const a=num(at(0));let result:number;
 switch(e.op){case "floor":result=Math.floor(a);break;case "ceil":result=Math.ceil(a);break;case "round":result=Math.round(a);break;default:{const b=num(at(1));switch(e.op){case "add":result=a+b;break;case "sub":result=a-b;break;case "mul":result=a*b;break;case "div":if(b===0)throw Error("DIVISION_BY_ZERO");result=a/b;break;case "min":result=Math.min(a,b);break;case "max":result=Math.max(a,b);break;case "lt":return a<b;case "lte":return a<=b;case "clamp":{const c=num(at(2));if(b>c)throw Error("INVALID_BOUNDS");result=Math.min(c,Math.max(b,a));break;}default:throw Error("INVALID_OPERATOR");}}}
 if(!Number.isFinite(result))throw Error("NUMERIC_OVERFLOW");return result;
 }return run(expr);
}
