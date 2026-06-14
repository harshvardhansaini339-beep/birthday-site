import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const supabase = window.supabase.createClient(
  "https://drjzqnhzhzsvfqebuayo.supabase.co",
  "YOUR_ANON_KEY"
);

export default function GiftPage() {
  const { slug } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from("birthdaySite")
        .select("*")
        .eq("slug", slug)
        .single();

      setData(data);
    };

    fetchData();
  }, [slug]);

  if (!data) return <h1>Loading...</h1>;

  return (
    <div>
      <h1>{data.title}</h1>
      <p>{data.details}</p>
    </div>
  );
}
