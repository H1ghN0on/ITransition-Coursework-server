import express from "express";
import { createErrorMessage, merge } from "../utils";

const {
  Item,
  ItemAttribute,
  ItemAttributeValue,
  Collection,
} = require("../models");

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

const removeItemAttribute = async (
  items: any,
  accessor: string,
  type: string
) => {
  const itemAttribute = await ItemAttribute.findOne({
    where: { accessor, type },
  });
  const itemIds = items.map((obj: any) => obj.id);

  if (itemAttribute) {
    const itemAttributeValues = await ItemAttributeValue.findAll({
      where: { attribute_id: itemAttribute.id },
    });
    let length = itemAttributeValues.length;
    console.log(itemIds);
    console.log(length);
    for (let value of itemAttributeValues) {
      if (itemIds.includes(value.item_id)) {
        await value.destroy();
        await value.save();
        length--;
      }
    }

    if (!itemAttributeValues || length == 0) {
      await itemAttribute.destroy();
      await itemAttribute.save();
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

    await ItemAttributeValue.create({
      [el.type]: el.value,
      item_id,
      attribute_id: itemAttribute.id,
    });
    itemAttributeValues.push({
      accessor: itemAttribute.accessor,
      value: el.value,
    });
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
    itemAttributeValues.push({
      accessor: itemAttribute.accessor,
      value: el.value,
    });
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
  let finalAttrs: any = [];
  for (let value of values) {
    const { attribute_id } = value;
    const attr = await ItemAttribute.findOne({
      where: { id: attribute_id },
    });
    finalValues.push({
      accessor: attr.dataValues.accessor,
      value: value[attr.type],
    });
    finalAttrs.push(attr.dataValues);
  }
  return { values: finalValues, columns: finalAttrs };
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
      const item = await Item.create({ name, tags, belongsTo: collectionId });
      const collection = await Collection.findOne({
        where: { id: collectionId },
      });
      await collection.update({ items: collection.items + 1 });
      await collection.save();
      const itemAttributeValues = await addToItemAttributeValues(item.id, info);
      res.send({
        status: "OK",
        item: {
          id: item.id,
          name,
          tags,
          ...Object.assign(
            {},
            ...itemAttributeValues.map((value: any) => ({
              [value.accessor]: value.value.toString(),
            }))
          ),
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
      let finalColumns: any[] = [];
      for (let item of dbItems) {
        const { id } = item;
        const dbValues = await ItemAttributeValue.findAll({
          where: { item_id: id },
        });
        const { values, columns } = await getCorrectValues(dbValues);
        finalColumns = finalColumns.concat(columns);

        items.push({
          id: item.id,
          ...Object.assign(
            {},
            ...values.map((value: any) => ({
              [value.accessor]: value.value.toString(),
            }))
          ),
          name: item.name,
          tags: item.tags,
          belongsTo: item.belongsTo,
          createdAt: item.createdAt,
        });
      }

      const columns = [
        ...new Map(finalColumns.map((item) => [item["id"], item])).values(),
      ];
      res.send({
        status: "OK",
        columns,
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
      const item = await Item.findOne({ where: { id } });
      await item.update({ name, tags });
      await item.save();
      const itemAttributeValues = await editItemAttributeValue(id, info);
      res.send({
        status: "OK",
        item: {
          id,
          name,
          tags,
          ...Object.assign(
            {},
            ...itemAttributeValues.map((value: any) => ({
              [value.accessor]: value.value.toString(),
            }))
          ),
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
      const collection = await Collection.findOne({
        where: { id: item.belongsTo },
      });
      await collection.update({ items: collection.items - 1 });
      await collection.save();
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
      const { collectionId, name, accessor, type, initValue } = req.body;
      await addItemAttribute(name, type, accessor);

      const items = await Item.findAll({ where: { belongsTo: collectionId } });
      for (let item of items) {
        const obj = {
          type,
          value: initValue,
          accessor,
          name,
        };
        await addToItemAttributeValues(item.id, [obj]);
      }

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
      const { collectionId, accessor, type } = req.body;
      const items = await Item.findAll({
        where: { belongsTo: collectionId },
      });

      await removeItemAttribute(items, accessor, type);
      res.send({ status: "OK" });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .send(createErrorMessage("Error", "Database Error occured"));
    }
  }

  async getById(req: express.Request, res: express.Response) {
    try {
      const id = req.params.id;

      const dbItem = await Item.findOne({
        where: { id },
      });

      const collection = await Collection.findOne({
        where: { id: dbItem.belongsTo },
      });

      const dbItemValues = await ItemAttributeValue.findAll({
        where: { item_id: id },
      });

      const { columns, values } = await getCorrectValues(dbItemValues);

      const info = merge(columns, values);

      res.send({
        status: "OK",
        item: {
          ...dbItem.dataValues,
          info,
          belongsTo: collection.dataValues.name,
        },
      });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .send(createErrorMessage("Error", "Database Error occured"));
    }
  }
}

export default new ItemController();
