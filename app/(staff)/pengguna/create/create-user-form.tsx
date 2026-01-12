"use client";

import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import {z} from "zod";

import {Button} from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {createUser} from "@/lib/actions/pengguna";
import {toast} from "sonner";
import {useRouter} from "next/navigation";

const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  nama_lengkap: z.string(),
  no_telepon: z.string().min(10),
  posyandu_id: z.string().nullable(),
  role: z.enum(["super_admin", "petugas", "ahli_gizi", "ibu"]),
  password: z.string().min(8),
});

type PosyanduItem = {
  id: string;
  nama_posyandu: string;
};

type Props = {
  posyandu: PosyanduItem[];
};

export function CreateUserForm({posyandu}: Props) {
  const {push} = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      nama_lengkap: "",
      no_telepon: "",
      password: "",
      posyandu_id: "",
      role: "petugas",
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
    try {
      await createUser(values);
      toast.success("Berhasil Membuat Pengguna!");
      push("/pengguna");
    } catch (error) {
      console.log(error);
      toast.success("Gagal Membuat Pengguna!");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="username"
          render={({field}) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Contoh : alisyaanggraini" {...field} />
              </FormControl>
              <FormDescription>Tidak menggunakan spasi</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nama_lengkap"
          render={({field}) => (
            <FormItem>
              <FormLabel>Nama Lengkap</FormLabel>
              <FormControl>
                <Input placeholder="Contoh : Alisya Anggraini" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="no_telepon"
          render={({field}) => (
            <FormItem>
              <FormLabel>Nomor Telepon</FormLabel>
              <FormControl>
                <Input placeholder="Contoh : 087645679127" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({field}) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <FormControl>
                <Select value={field?.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ibu">Ibu</SelectItem>
                    <SelectItem value="petugas">Petugas Posyandu</SelectItem>
                    <SelectItem value="ahli_gizi">Ahli Gizi</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="posyandu_id"
          render={({field}) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <FormControl>
                <Select
                  value={field?.value || undefined}
                  onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih Posyandu" />
                  </SelectTrigger>
                  <SelectContent>
                    {posyandu?.map(({id, nama_posyandu}) => (
                      <SelectItem key={id} value={id}>
                        {nama_posyandu}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({field}) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  placeholder="Masukan Password"
                  type="password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="space-x-5 text-end">
          <Button
            onClick={() => push("/pengguna")}
            disabled={form.formState.isSubmitting}
            variant={"ghost"}
            className="border"
            type="reset">
            Cancel
          </Button>
          <Button type="submit">Submit</Button>
        </div>
      </form>
    </Form>
  );
}
