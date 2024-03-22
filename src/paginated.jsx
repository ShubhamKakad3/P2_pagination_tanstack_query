// pagination using react query
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";

//"debouncing" is a technique used to ensure that a function is not called too frequently, particularly in response to some event such as a user input or scroll event. This is often important in scenarios like handling user input in web applications, where you may want to perform an action only after the user has stopped typing for a certain period of time. Lodash is a popular JavaScript utility library that provides many helpful functions for working with arrays, objects, functions, and more. One of the functions provided by Lodash is _.debounce(), which is used for debouncing.
import debounce from "lodash.debounce";

function Products() {
  // 1. useSearchParams
  const [searchParams, setSearchParams] = useSearchParams({
    limit: 4,
    skip: 0,
  });
  const limit = parseInt(searchParams.get("limit") || 4);
  const skip = parseInt(searchParams.get("skip") || 0);
  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";

  // this is only for the categories fetching
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("https://dummyjson.com/products/categories");
      return res.json();
    },
  });

  // this is the main product data fetching
  const { data: products, isLoading } = useQuery({
    queryKey: ["products", limit, skip, q, category],
    queryFn: async () => {
      let url = `https://dummyjson.com/products/search?limit=${limit}&skip=${skip}&q=${q}`;
      if (category) {
        url = `https://dummyjson.com/products/category/${category}?limit=${limit}&skip=${skip}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      console.log(data);
      return data.products;
    },
    // 2. the placeholderData option is used to specify the initial data that should be displayed while fetching the actual data from the server. When placeholderData is provided, React Query will immediately use this data to update the UI while it fetches the real data in the background. This helps to provide a seamless user experience by preventing the UI from appearing empty or flickering while waiting for data. If you want to keep the previous data while fetching new data, you can use the keepPreviousData option in combination with placeholderData. This option tells React Query to keep showing the previous data while it's fetching new data. Once the new data is fetched successfully, React Query will update the UI with the new data.
    placeholderData: keepPreviousData,
    // 3. it is a caching time for fetched data until no request will be sent to the server
    staleTime: 15000,
  });

  //  logic for pagination buttons - prev and next
  const handleState = (limit) => {
    setSearchParams((prev) => prev.set("skip", Math.max(skip + limit, 0)));
  };

  return (
    <>
      {isLoading && <h1>Loading...</h1>}
      <div className="bg-white">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">
              My store
            </h2>
          </div>
          <div>
            <div className="relative mt-2 rounded-md flex items-center gap-8 mb-4">
              <input
                // 4. debounce
                onChange={debounce((e) => {
                  e.preventDefault();
                  setSearchParams((prev) => {
                    prev.set("q", e.target.value);
                    prev.set("skip", 0);
                    prev.delete("category"); //this is not the proper way to handle
                    return prev;
                  });
                }, 1000)}
                type="text"
                name="price"
                id="price"
                className="block w-full rounded-md border-0 py-1.5 pl-7 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder="IPhone"
              />
              <select
                className="border p-2"
                onChange={(e) => {
                  setSearchParams((prev) => {
                    prev.set("skip", 0);
                    prev.delete("q");
                    prev.set("category", e.target.value);
                    return prev;
                  });
                }}
              >
                <option>Select category</option>
                {categories?.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
            {products?.map((product) => (
              <div key={product.id} className="group relative">
                <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-md bg-gray-200 lg:aspect-none group-hover:opacity-75 lg:h-64">
                  <img
                    src={product.thumbnail}
                    alt={product.title}
                    className="h-full w-full object-cover object-center lg:h-full lg:w-full"
                  />
                </div>
                <div className="mt-4 flex justify-between">
                  <div>
                    <h3 className="text-sm text-gray-700">
                      <a href="">
                        <span aria-hidden="true" className="absolute inset-0" />
                        {product.title}
                      </a>
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {product.category}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {product.price}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 mt-12">
            <button
              disabled={skip < limit}
              className="bg-purple-500 px-4 py-1 text-white rounded"
              onClick={() => handleState(-limit)}
            >
              Prev
            </button>
            <button
              // logic remain for the button disable
              // disabled={limit+skip >= products?.total}
              className="bg-purple-500 px-4 py-1 text-white rounded"
              onClick={() => handleState(limit)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Products;
