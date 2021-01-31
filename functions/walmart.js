const puppeteer = require('puppeteer');

const { db } = require('./util/admin');

const getProductByLink = async () => {
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();

    const wallmartUrl=`https://www.walmart.ca/en/grocery/natural-organic-food/N-3992/page-5`;//page-2
    await page.goto(wallmartUrl,{waitUntil:'networkidle2'});

    const data =  await page.evaluate( () => {
        let products=[]
        let category = document.querySelectorAll("#breadcrumb ol li:nth-child(3) span:nth-child(2)")[0].textContent

        const productsHTML= document.querySelectorAll(".product")
        if(productsHTML){
            productsHTML.forEach((product,i) => {
                if(i<50){
    
                    let id = product.attributes["data-rollup-id"].value
                    let name = product.querySelector('.title')          ?  product.querySelector('.title').innerText : ""
                    let unit = product.querySelector(".description")    ? product.querySelector(".description").innerText  : ""
                    let price = product.querySelector(".price-current").outerText
                    let priceUnit = product.querySelector(".price-unit").outerText
                    let image = product.querySelector(".image").attributes['data-original'].value
        
                    product = {
                        id,
                        name,
                        category,
                        price,
                        unit,
                        priceUnit,
                        image
        
                    }
                    productDATA = {
                        id: product.id,
                        name: product.name,
                        category: product.category,
                        price: product.price,
                        unit: product.unit,
                        priceUnit: product.priceUnit,
                        image: product.image
        
                    }
    
                    products.push(product)
                }
    
            })
        }
        else{
            console.log("wallmart caught Us!")
        }
        
        return products

    }).catch(err => console.log("Wallmart Caught Us!"))

    await browser.close()
    return data

}
const  searchProduct =  () => {
    
}




module.exports={getProductByLink,searchProduct};