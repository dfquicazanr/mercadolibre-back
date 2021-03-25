import express from "express";
import axios from "axios";

const app = express();
const port = 8080; // default port to listen

const mercadolibreApiBaseUri = 'https://api.mercadolibre.com/sites/MLA';
const author = {
    name: 'Daniel Francisco',
    lastName: 'Quicazán Rubio'
}

// define a route handler for the default home page
app.get( "/", ( req, res ) => {
    res.send( "Hello world!" );
} );

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
            decimals: ''
        },
        picture: rawItem.thumbnail,
        condition: rawItem.condition,
        free_shipping: rawItem.shipping.free_shipping
    }
}

const extractItems = (data: any) => {
    return data.results.map((result: any) => itemsMapper(result));

}

app.get('/api/items', async (request, response) => {
    const {q: query} = request.query;
    const result = await axios.get(`${mercadolibreApiBaseUri}/search`, {params: {q: query}});
    const { data } = result;
    const categories = extractCategories(data);
    const items = extractItems(data);
    const queryResponse = {
        author,
        categories,
        items
    }
    response.send(JSON.stringify(queryResponse, null, 4));
})

// start the Express server
app.listen( port, () => {
    // tslint:disable-next-line:no-console
    console.log( `server started at http://localhost:${ port }` );
} );