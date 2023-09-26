export async function load({ fetch }) {
  const res = await fetch(" http://localhost:3000/auctions");
  const auctions = await res.json();
  console.log(auctions);
  return {
    auctions,
  };
}
