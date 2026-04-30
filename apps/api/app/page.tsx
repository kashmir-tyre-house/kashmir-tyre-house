export default function ApiHome() {
  return (
    <main style={{ fontFamily: "sans-serif", padding: 32 }}>
      <h1>Kashmir Tyre House API</h1>
      <p>Next.js route-handler backend for products, enquiries, media, and admin.</p>
      <ul>
        <li>
          <a href="/api/health">/api/health</a>
        </li>
        <li>
          <a href="/api/products">/api/products</a>
        </li>
      </ul>
    </main>
  );
}
