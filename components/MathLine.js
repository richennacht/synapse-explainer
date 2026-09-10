"use client";

import katex from "katex";
import "katex/dist/katex.min.css";

const formulas = [
 [/^Δw = A₊/,String.raw`\Delta w = A_{+}\,e^{-\Delta t/\tau_{+}} \quad \text{if }\Delta t>0 \quad \text{(potentiation)}`],
 [/^Δw = −A₋/,String.raw`\Delta w = -A_{-}\,e^{\Delta t/\tau_{-}} \quad \text{if }\Delta t\le 0 \quad \text{(depression)}`],
 [/^Δwᵢⱼ  =  η · xᵢ/,String.raw`\Delta w_{ij}=\eta x_i y_j`],
 [/^ΔW  =/,String.raw`\Delta W=\eta\,yx^{\mathsf T}\in\mathbb{R}^{m\times n}`],
 [/^Δwᵢⱼ  =  η · \(/,String.raw`\Delta w_{ij}=\eta\left(x_i y_j-y_j^2w_{ij}\right)`],
 [/^hₜ  =/,String.raw`h_t=f\!\left(W_{\mathrm{slow}}x_t+W_{\mathrm{fast},t}x_t\right)`],
 [/^qₜ =/,String.raw`q_t=W_Qx_t,\qquad k_t=W_Kx_t,\qquad v_t=W_Vx_t`],
 [/^Attn/,String.raw`\operatorname{Attn}(q_t,K,V)=\operatorname{softmax}\!\left(\frac{q_tK^{\mathsf T}}{\sqrt{d_k}}\right)V`],
 [/^KV Cache size/,String.raw`\operatorname{KV\ cache\ size}=2LHd_kT\times\text{bytes per element}`],
 [/^Mₜ  =/,String.raw`M_t=\lambda M_{t-1}+\eta\left(v_t\otimes k_t\right)`],
 [/^    \+  η/,String.raw`\eta\left(v_t\otimes k_t\right)\qquad\text{write new association}`],
 [/^v̂  =  Mₜ/,String.raw`\hat v=M_tq`],
 [/^v̂  =  v k/,String.raw`\hat v=vk^{\mathsf T}q=v\,\langle k,q\rangle`],
 [/^M q₁/,String.raw`Mq_1=(v_1k_1^{\mathsf T}+v_2k_2^{\mathsf T})q_1`],
 [/^      =  v₁/,String.raw`=v_1\langle k_1,q_1\rangle+v_2\langle k_2,q_1\rangle`],
 [/^P\(deg/,String.raw`P(\deg(v)=k)\propto k^{-\alpha},\qquad\alpha>1`],
 [/^Wᵗ  =  λ.*sᵗ ⊗ sᵗ$/,String.raw`W^t=\lambda W^{t-1}+\eta\,s^t\otimes s^t`],
 [/^Wᵢⱼᵗ  =/,String.raw`W_{ij}^t=\lambda W_{ij}^{t-1}+\eta\,s_i^t s_j^{t-1}`],
 [/^ΔWᵢⱼ/,String.raw`\Delta W_{ij}=\eta\,s_i^t s_j^{t-1}\qquad\forall(i,j)\in E`],
 [/^sᵢᵗ⁺¹/,String.raw`s_i^{t+1}=\sigma\!\left(\sum_{j\in N(i)}W_{ij}^t s_j^t+b_i\right)`],
 [/^k  =  φ/,String.raw`k=\phi(c),\qquad v=\psi(a)`],
 [/^Wᵗ  =  λ.*v ⊗ k/,String.raw`W^t=\lambda W^{t-1}+\eta\,v\otimes k`],
 [/^hₜ₊₁/,String.raw`h_{t+1}=f\!\left(W_{\mathrm{slow}}x_t+W^t h_t\right)`],
 [/^v̂  =  Wᵗ/,String.raw`\hat v=W^t\phi(c')`],
 [/^v̂  ≈/,String.raw`\hat v\approx\eta\lVert k\rVert^2v+\text{residual from }W^{t-1}`],
 [/^  sᵗ  =  TopK/,String.raw`s^t=\operatorname{TopK}\!\left(\operatorname{ReLU}\!\left(\sum_{j\in N(i)}W_{ij}^{t-1}s_j^{t-1}+W_{\mathrm{slow}}x_t\right)\right)`],
 [/^  Wᵗ  =/,String.raw`W^t=\lambda W^{t-1}+\eta\,s^t\otimes s^{t-1}`],
 [/^  yₜ  =/,String.raw`y_t=\operatorname{Decode}(s^t)`]
];

export function formulaFor(line){return formulas.find(([pattern])=>pattern.test(line))?.[1]||null}

export default function MathLine({line}){
 const formula=formulaFor(line);
 if(!formula)return null;
 return <div className="math-line" role="img" aria-label={line} dangerouslySetInnerHTML={{__html:katex.renderToString(formula,{displayMode:true,throwOnError:false,strict:false})}}/>;
}

