import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();
app.use(cors());
const port = 8080; // default port to listen

const mercadolibreApiBaseUri = 'https://api.mercadolibre.com';
const author = {
  name: 'Daniel Francisco',
  lastName: 'Quicazán Rubio'
}

const extractCategories = (data: any) => {
  const rawCategories = data.available_filters.find((filter: any) => filter.id = 'category').values;
  return rawCategories.map((category: any) => category.name);
}

const itemsMapper = (rawItem: any) => {
  return {
    id: rawItem.id,
    title: rawItem.title,
    price: {
      currency: rawItem.currency_id,
      amount: rawItem.price,
      decimals: 0
    },
    picture: rawItem.thumbnail,
    condition: rawItem.condition,
    free_shipping: rawItem.shipping.free_shipping
  };
}

const extractItems = (data: any) => {
  return data.results.map((result: any) => itemsMapper(result));
}

app.get('/api/items', async (request, response) => {
  try {
    const {q: query} = request.query;
    const {data} = await axios.get(`${mercadolibreApiBaseUri}/sites/MLA/search`, {params: {q: query}});
    const categories = extractCategories(data);
    const items = extractItems(data);
    const queryResponse = {
      author,
      categories,
      items
    };
    response.send(JSON.stringify(queryResponse));
  } catch (e) {
    response.statusCode = 500;
    response.send(JSON.stringify(e))
  }
})


app.get('/api/items/:id', async (request, response) => {
  try {
    const { id } = request.params;
    const { data: idData } = await axios.get(`${mercadolibreApiBaseUri}/items/${id}`);
    const { data: idDescriptionData } = await axios.get(`${mercadolibreApiBaseUri}/items/${id}/description`);
    const queryResponse = {
      author,
      item: {
        id,
        title: idData.title,
        price: {
          currency: idData.currency_id,
          amount: idData.price,
          decimals: 0
        },
        picture: idData.thumbnail,
        condition: idData.condition,
        free_shipping: idData.shipping.free_shipping,
        sold_quantity: idData.sold_quantity,
        description: idDescriptionData.plain_text
      }
    };
    response.send(JSON.stringify(queryResponse));
  } catch (e) {
    response.statusCode = 500;
    response.send(JSON.stringify(e))
  }
})

// start the Express server
app.listen( port, () => {
  // tslint:disable-next-line:no-console
  console.log( `server started at http://localhost:${ port }` );
} );