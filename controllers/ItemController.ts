import express from "express";
import { createErrorMessage } from "../utils";

const { Item, ItemAttribute, ItemAttributeValue } = require("../models");

interface ItemAttributeInfo {
  type: "checkbox" | "string" | "date" | "number" | "text";
  value: any;
  accessor: string;
  name: string;
}

const getItemAttribute = async (el: ItemAttributeInfo) => {
  let itemAttribute = await ItemAttribute.findOne({
    where: {
      accessor: el.accessor,
      type: el.type,
    },
  });
  if (!itemAttribute) {
    itemAttribute = await addItemAttribute(el.name, el.type, el.accessor);
  }
  return itemAttribute;
};

const addItemAttribute = async (
  name: string,
  type: string,
  accessor: string
) => {
  const itemAttribute = await ItemAttribute.create({
    accessor,
    type,
    name,
  });
  return itemAttribute;
};

const removeItemAttribute = async (accessor: string, type: string) => {
  const itemAttribute = await ItemAttribute.findOne({
    where: { accessor, type },
  });

  if (itemAttribute) {
    const itemAttributeValue = await ItemAttributeValue.findOne({
      where: { attribute_id: itemAttribute.id },
    });
    if (!itemAttributeValue) {
      await itemAttribute.destroy();
    }
  }
};

const addToItemAttributeValues = async (
  item_id: number,
  info: ItemAttributeInfo[]
) => {
  let itemAttributeValues: any = [];
  for (let el of info) {
    const itemAttribute = await getItemAttribute(el);
    const itemAttributeValue = await ItemAttributeValue.create({
      [el.type]: el.value,
      item_id,
      attribute_id: itemAttribute.id,
    });
    itemAttributeValues.push({ itemAttributeValue });
  }
  return itemAttributeValues;
};

const editItemAttributeValue = async (
  item_id: number,
  info: ItemAttributeInfo[]
) => {
  let itemAttributeValues: any = [];
  for (let el of info) {
    const itemAttribute = await getItemAttribute(el);
    const itemAttributeValue = await ItemAttributeValue.findOne({
      where: {
        item_id,
        attribute_id: itemAttribute.id,
      },
    });
    await itemAttributeValue.update({
      [el.type]: el.value,
    });
    await itemAttributeValue.save();
    itemAttributeValues.push({ itemAttributeValue });
  }
  return itemAttributeValues;
};

const deleteItemAttributeValues = async (item_id: number) => {
  await ItemAttributeValue.destroy({
    where: {
      item_id,
    },
  });
};

const getCorrectValues = async (values: any) => {
  let finalValues: any = [];
  for (let value of values) {
    const { attribute_id } = value;
    const attr = await ItemAttribute.findOne({
      where: { id: attribute_id },
    });
    finalValues.push({
      name: attr.dataValues.name,
      value: value[attr.type],
    });
  }
  return [finalValues];
};

class ItemController {
  async create(req: express.Request, res: express.Response) {
    const user = req.user as any;
    if (!user) {
      res.status(401).send(createErrorMessage("Error", "Unauthorized"));
      return;
    }
    try {
      const { collectionId, name, tags, info } = req.body;

      // const testInfo: ItemAttributeInfo[] = [
      //   {
      //     type: "checkbox",
      //     name: "True",
      //     accessor: "true",
      //     value: false,
      //   },
      //   {
      //     type: "string",
      //     name: "Memes",
      //     value: "Noooo",
      //     accessor: "memes",
      //   },
      //   {
      //     type: "text",
      //     name: "About",
      //     accessor: "about",
      //     value:
      //       "Chiaki nanami is the best girl Chiaki nanami is the best girl Chiaki nanami is the best girl",
      //   },
      // ];
      const item = await Item.create({ name, tags, belongsTo: collectionId });

      const itemAttributeValues = await addToItemAttributeValues(item.id, info);
      res.send({
        status: "OK",
        item: {
          ...item,
          ...itemAttributeValues,
        },
      });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .send(createErrorMessage("Error", "Database Error occured"));
    }
  }

  async getAllFromCollection(req: express.Request, res: express.Response) {
    try {
      const id = req.params.id;

      const dbItems = await Item.findAll({
        where: { belongsTo: id },
        order: [["id", "ASC"]],
      });
      let items: any = [];
      for (let item of dbItems) {
        const { id } = item;
        const dbValues = await ItemAttributeValue.findAll({
          where: { item_id: id },
        });
        const values = await getCorrectValues(dbValues);
        items.push({
          id: item.id,
          values: values,
          name: item.name,
          tags: item.tags,
          belongsTo: item.belongsTo,
        });
      }

      res.send({
        status: "OK",
        items,
      });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .send(createErrorMessage("Error", "Database Error occured"));
    }
  }

  async edit(req: express.Request, res: express.Response) {
    const user = req.user as any;
    if (!user) {
      res.status(401).send(createErrorMessage("Error", "Unauthorized"));
      return;
    }
    try {
      const { id, name, tags, info } = req.body;
      const item = await Item.update({ name, tags }, { where: { id } });
      const itemAttributeValues = await editItemAttributeValue(id, info);
      res.send({
        status: "OK",
        item: {
          ...item,
          ...itemAttributeValues,
        },
      });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .send(createErrorMessage("Error", "Database Error occured"));
    }
  }

  async delete(req: express.Request, res: express.Response) {
    const user = req.user as any;
    if (!user) {
      res.status(401).send(createErrorMessage("Error", "Unauthorized"));
      return;
    }
    try {
      const id = req.params.id;
      const item = await Item.findOne({ where: { id } });
      if (item) {
        await item.destroy();
      }
      await deleteItemAttributeValues(+id);
      res.send({
        status: "OK",
      });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .send(createErrorMessage("Error", "Database Error occured"));
    }
  }
  async createColumn(req: express.Request, res: express.Response) {
    const user = req.user as any;
    if (!user) {
      res.status(401).send(createErrorMessage("Error", "Unauthorized"));
      return;
    }
    try {
      const { name, accessor, type } = req.body;
      await addItemAttribute(name, type, accessor);
      res.send({ status: "OK" });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .send(createErrorMessage("Error", "Database Error occured"));
    }
  }
  async deleteColumn(req: express.Request, res: express.Response) {
    const user = req.user as any;
    if (!user) {
      res.status(401).send(createErrorMessage("Error", "Unauthorized"));
      return;
    }
    try {
      const { accessor, type } = req.body;
      await removeItemAttribute(accessor, type);
      res.send({ status: "OK" });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .send(createErrorMessage("Error", "Database Error occured"));
    }
  }
}

export default new ItemController();
