import db from "../createDatabase";
import { IConfigs } from "../interfaces/IConfigs";
import { IProduct } from "../interfaces/IProduct";

export const insertProducts = async ({
  configs,
  products,
}: {
  configs: IConfigs;
  products: any;
}) => {
  db.transaction(() => {
    const insertProduct = db.prepare(`
        INSERT OR REPLACE INTO products (
          id, store_id, product_id, name, price, discount, real_price, image_url, 
          quantity, unit_type, pum, stock, navigation
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

    // Inserção em Lote de Produtos
    const insertMany = db.transaction((products: IProduct[]) => {
      for (const product of products) {
        insertProduct.run(
          product.id,
          configs.stores[0],
          product.product_id,
          product.name,
          product.price,
          product.discount,
          product.real_price,
          product.image_url,
          product.quantity,
          product.unit_type,
          product.pum,
          product.stock,
          JSON.stringify(product.navigation) // Considere otimizar o armazenamento, se possível
        );
      }
    });

    insertMany(products);
  })();
};
