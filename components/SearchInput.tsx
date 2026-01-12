"use client";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {SearchIcon} from "lucide-react";
import {useDebouncedCallback} from "use-debounce";

import {useSearchParams, usePathname, useRouter} from "next/navigation";

type Props = {placeholder?: string};

const SearchInput = ({placeholder = "Type to search"}: Props) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const {replace} = useRouter();

  const handleChange = useDebouncedCallback((value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set("page", "1");
      params.set("perPage", "10");
      params.set("q", value);
    } else {
      params.delete("q");
    }
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  return (
    <InputGroup>
      <InputGroupInput
        placeholder={placeholder}
        defaultValue={searchParams.get("q")?.toString()}
        onChange={(event) => handleChange(event.target.value)}
      />
      <InputGroupAddon>
        <SearchIcon />
      </InputGroupAddon>
    </InputGroup>
  );
};

export default SearchInput;
