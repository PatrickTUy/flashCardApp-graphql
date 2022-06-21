import { objectType } from "nexus";

export const User = objectType({
    name: "User",
    definition(t) {
        t.nonNull.int("id");
        t.nonNull.string("name");
        t.nonNull.string("email");
        t.nonNull.list.nonNull.field("flashCards", {    
            type: "FlashCard",
            resolve(parent:any, args:any, context:any) {  
                return context.prisma.user  
                    .findUnique({ where: { id: parent.id } })
                    .flashCards();
            },
        }); 
    },
});