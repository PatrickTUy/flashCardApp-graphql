import { extendType, nonNull,nullable, objectType, stringArg, intArg, inputObjectType, enumType, arg,list } from "nexus";

import { Prisma } from "@prisma/client";


export const LinkOrderByInput = inputObjectType({
  name: "LinkOrderByInput",
  definition(t) {
      t.field("description", { type: Sort });
      t.field("url", { type: Sort });
      t.field("createdAt", { type: Sort });
  },
});

export const Sort = enumType({
  name: "Sort",
  members: ["asc", "desc"],
});


export const FlashCard = objectType({
    name: "FlashCard",  
    definition(t) {  
        t.nonNull.int("id"); 
        t.nonNull.string("description"); 
        t.nonNull.string("url"); 
        t.string("isDone");
        t.nonNull.dateTime("createdAt"); 
        t.field("addedBy", {   
          type: "User",
          resolve(parent:any, args:any, context:any) {  
              return context.prisma.flashCard
                  .findUnique({ where: { id: parent.id } })
                  .addedBy();
          },
      });
    },
});

export const FlashCardMutation = extendType({
  type:"Mutation",
  definition(t) {

    t.nonNull.field("deleteFlashCard",{
      type:"FlashCard",
      args: {
        id:nonNull(intArg()),
      },
       async resolve(parent:any, args:any, context:any) {
        const { userId } = context;

        if (!userId) {  
            throw new Error("Cannot delete flash Card without logging in.");
        }

        const flashcard = await context.prisma.flashCard.findUnique({
          where:{ id:args.id }
        })

       //@ts-ignore
        if(flashcard.addedById !== userId){
          throw new Error("Cannot not delete flashCard that does not belong to you.");
        }

        return  context.prisma.flashCard.delete({
           where: {id:args.id}
        });

      },
    })

    
    t.nonNull.field("editFlashCard",{
      type:"FlashCard",
      args: {
        id:nonNull (intArg()),
        description: nullable (stringArg()),
        url:nullable(stringArg()),
        isDone:nullable(stringArg())
      },
      async resolve(parent:any, args:any, context:any) {
        const { description, url,isDone } = args;
        const { userId } = context;

        if (!userId) { 
            throw new Error("Cannot edit flash Card without logging in.");
        }
       
        const flashcard = await context.prisma.flashCard.findUnique({
          where:{ id:args.id }
        })

       //@ts-ignore
        if(flashcard.addedById !== userId){
          throw new Error("Cannot not edit flashCard that does not belong to you.");
        }
        
        const editedFlashCard = context.prisma.flashCard.update({
          where:{id: userId},
            data: {
                ...( description && {description}),
                ...( url&& { url } ),
                ...(isDone != null && { isDone }), 
                addedBy: { connect: { id: userId } }, 
            },
        });

        return editedFlashCard;
      },
    })
  




    t.nonNull.field("addFlashCard",{
      type:"FlashCard",
      args: {
        description: nonNull (stringArg()),
        url:nonNull(stringArg()),
      },
      resolve(parent:any, args:any, context:any) {
        const { description, url } = args;
        const { userId } = context;

        if (!userId) {  
            throw new Error("Cannot add flash Card without logging in.");
        }

        const newFlashCard = context.prisma.flashCard.create({
            data: {
                description,
                url,
                isDone:'false',
                addedBy: { connect: { id: userId } },  
            },
        });

        return newFlashCard;
      },
    })
  },

})

export const FlashCardQuery = extendType({
  type:"Query",
  definition(t) {
   
   t.field("getFlashCard",{ 
     type:"FlashCard",
     args:{
       id:nonNull (intArg()),
     },
     resolve(parent:any, args:any, context:any) {
       return context.prisma.flashCard.findUnique({
         where:{id:args.id}
       })
     }
   })


    t.nonNull.list.nonNull.field("feed", {
        type: "FlashCard",
        args:{
          orderBy: arg({ type: list(nonNull(LinkOrderByInput)) }),
        },
        resolve(parent:any, args:any, context:any) {  
            return context.prisma.flashCard.findMany({
              orderBy: args?.orderBy as Prisma.Enumerable<Prisma.FlashCardOrderByWithRelationInput> | undefined, 
            });  
        },
    });
},
});