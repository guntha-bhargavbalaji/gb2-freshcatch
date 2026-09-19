const WA_NUMBER="919493033331";
const supabaseClient = (window.SUPABASE_URL.startsWith("http") && window.SUPABASE_ANON_KEY.length > 20)
 ? supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY) : null;
let PRODUCTS=[];

function money(n){return "₹"+Number(n).toLocaleString("en-IN")}
function cart(){return JSON.parse(localStorage.getItem("gb2_cart")||"[]")}
function saveCart(c){localStorage.setItem("gb2_cart",JSON.stringify(c))}
function total(){return cart().reduce((s,i)=>s+i.price*i.qty,0)}

async function loadProducts(){
 const grid=document.getElementById("productGrid");
 if(!supabaseClient){grid.innerHTML='<div class="empty">Supabase is not configured yet. Open <strong>config.js</strong> and add your Project URL and anon key.</div>';return}
 const {data,error}=await supabaseClient.from("products").select("*").eq("active",true).order("created_at",{ascending:false});
 if(error){grid.innerHTML='<div class="empty">Products could not be loaded. Check your Supabase setup.</div>';console.error(error);return}
 PRODUCTS=data||[]; renderProducts();
}
function renderProducts(){
 const filter=document.getElementById("categoryFilter").value,grid=document.getElementById("productGrid");
 const list=PRODUCTS.filter(p=>filter==="all"||p.category===filter);
 if(!list.length){grid.innerHTML='<div class="empty">No products available in this category right now.</div>';return}
 grid.innerHTML=list.map(p=>`<article class="product-card"><div class="product-image">${p.image_url?`<img src="${p.image_url}" alt="${escapeHtml(p.name)}" style="width:100%;height:100%;object-fit:cover">`:(p.emoji||"🛒")}</div><div class="product-body"><span class="unit">${escapeHtml(p.category)}</span><h3>${escapeHtml(p.name)}</h3><p class="muted">${escapeHtml(p.description||"")}</p><span class="price">${money(p.price)}</span> <span class="unit">${escapeHtml(p.unit)}</span><button class="btn add-btn" onclick="addToCart('${p.id}')">Add to Cart</button></div></article>`).join("");
}
function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function addToCart(id){const p=PRODUCTS.find(x=>x.id===id);if(!p)return;let c=cart(),i=c.find(x=>x.id===id);if(i)i.qty++;else c.push({id:p.id,name:p.name,price:p.price,unit:p.unit,qty:1});saveCart(c);renderCart();document.getElementById("cart").scrollIntoView({behavior:"smooth"});}
function changeQty(id,d){let c=cart(),i=c.find(x=>x.id===id);if(i){i.qty+=d;if(i.qty<=0)c=c.filter(x=>x.id!==id)}saveCart(c);renderCart()}
function renderCart(){
 const el=document.getElementById("cartItems"),sum=document.getElementById("cartSummary"),count=document.getElementById("cartCount"),ct=document.getElementById("checkoutTotal"),c=cart();
 count.textContent=c.reduce((s,i)=>s+i.qty,0);
 if(!c.length){el.innerHTML='<div class="empty">Your cart is empty. <a href="#products"><strong>Shop products →</strong></a></div>';sum.innerHTML="";ct.textContent="Cart total: ₹0";return}
 el.innerHTML=c.map(i=>`<div class="cart-row"><div><strong>${escapeHtml(i.name)}</strong><div class="unit">${money(i.price)} ${escapeHtml(i.unit)}</div></div><div class="qty"><button onclick="changeQty('${i.id}',-1)">−</button><strong>${i.qty}</strong><button onclick="changeQty('${i.id}',1)">+</button></div><strong class="line-total">${money(i.price*i.qty)}</strong><button class="danger" onclick="changeQty('${i.id}',-${i.qty})">Remove</button></div>`).join("");
 sum.innerHTML=`<strong>Total: ${money(total())}</strong><br><span class="unit">Proceed to checkout below</span>`;ct.textContent="Cart total: "+money(total());
}
document.getElementById("categoryFilter").addEventListener("change",renderProducts);
document.getElementById("checkoutForm").addEventListener("submit",e=>{
 e.preventDefault();const c=cart();if(!c.length){alert("Please add products to your cart first.");return}
 const name=document.getElementById("customerName").value.trim(),phone=document.getElementById("customerPhone").value.trim(),area=document.getElementById("customerArea").value,address=document.getElementById("customerAddress").value.trim(),notes=document.getElementById("customerNotes").value.trim();
 let msg=`*GB² FreshCatch — New Order*%0A%0A*Customer:* ${encodeURIComponent(name)}%0A*Mobile:* ${encodeURIComponent(phone)}%0A*Delivery area:* ${encodeURIComponent(area)}%0A*Address:* ${encodeURIComponent(address)}%0A%0A*Order:*%0A`;
 c.forEach(i=>msg+=`• ${encodeURIComponent(i.name)} × ${i.qty} = ${encodeURIComponent(money(i.price*i.qty))}%0A`);
 msg+=`%0A*Total: ${encodeURIComponent(money(total()))}*%0A*Delivery:* Sunday`;
 if(notes)msg+=`%0A*Notes:* ${encodeURIComponent(notes)}`;
 msg+=`%0A%0APlease confirm my order.`;
 window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`,"_blank");
});
document.getElementById("year").textContent=new Date().getFullYear();
loadProducts();renderCart();
