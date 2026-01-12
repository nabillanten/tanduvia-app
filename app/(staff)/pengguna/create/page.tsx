import {getAllPosyandu} from "@/lib/actions/posyandu";
import {CreateUserForm} from "./create-user-form";

type Props = object;

const CreateUserPage = async (props: Props) => {
  const allPosyandu = await getAllPosyandu();
  return (
    <section className="p-6">
      <CreateUserForm posyandu={allPosyandu} />
    </section>
  );
};

export default CreateUserPage;
