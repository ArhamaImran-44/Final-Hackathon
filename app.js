
const supabaseUrl = "https://ygkuxwnjqoksthnupvge.supabase.co";
const supabaseKey = "sb_publishable_FJK_9DuMbpGxslctbtZaMQ_iDpglgH5";

const { createClient } = supabase;

const client = createClient(supabaseUrl, supabaseKey);

console.log(client);


// SIGNUP

const signupForm = document.querySelector("#signupForm");

if (signupForm) {

    const signupBtn = document.querySelector("#signupBtn");
    const fullName = document.querySelector("#name");
    const email = document.querySelector("#email");
    const password = document.querySelector("#password");

    signupForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        if (
            fullName.value === "" ||
            email.value === "" ||
            password.value === ""
        ) {
            Swal.fire({
                icon: "warning",
                title: "Missing Data",
                text: "Please fill all fields."
            });

            return;
        }

        try {

            const { data, error } = await client.auth.signUp({
                email: email.value,
                password: password.value
            });

            if (error) {

                Swal.fire({
                    icon: "error",
                    title: "Oops!",
                    text: error.message
                });

                return;
            }

            // Save user information

            const { data: database, error: databaseError } =
                await client
                    .from("user_data")
                    .insert({
                        fullName: fullName.value,
                        email: email.value,
                        user_id: data.user.id
                    })
                    .select();

            if (databaseError) {

                console.log(databaseError);

                Swal.fire({
                    icon: "error",
                    title: "Oops!",
                    text: databaseError.message
                });

                return;
            }

            console.log("Auth User:", data);
            console.log("Database User:", database);

            Swal.fire({
                icon: "success",
                title: "Successfully!",
                text: "Account created successfully."
            }).then(() => {

                window.location.href = "./login.html";

            });

        } catch (error) {

            console.log(error);

            Swal.fire({
                icon: "error",
                title: "Oops!",
                text: "Something went wrong."
            });
        }
    });
}
// LOGIN

const loginForm = document.querySelector("#loginForm");
if (loginForm) {

    const email = document.querySelector("#email");
    const password = document.querySelector("#password");
    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();
        if (
            email.value === "" ||
            password.value === ""
        ) {

            Swal.fire({
                icon: "warning",
                title: "Missing Data",
                text: "Please fill all fields."
            });
            return;
        }


        try {
            const { data, error } =
                await client.auth.signInWithPassword({
                    email: email.value,
                    password: password.value
                });


            if (error) {
                Swal.fire({
                    icon: "error",
                    title: "Oops!",
                    text: error.message
                });

                return;
            }
            console.log(data);


            Swal.fire({
                icon: "success",
                title: "Successfully!",
                text: "Login successful."
            }).then(() => {

                window.location.href = "./dashboard.html";
            });


        } catch (error) {
            console.log(error);
            Swal.fire({
                icon: "error",
                title: "Oops!",
                text: "Something went wrong."
            });
        }
    });

}

// DASHBOARD

const userName = document.querySelector("#userName");

if (userName) {
    const profileName = document.querySelector("#profileName");
    const userEmail = document.querySelector("#userEmail");
    const userInitial = document.querySelector("#userInitial");
    const logoutBtn = document.querySelector("#logoutBtn");


    async function getUser() {
        const { data, error } =
            await client.auth.getUser();


        if (error) {
            console.log(error);
            return;
        }

        if (!data.user) {
            window.location.href = "./login.html";
            return;
        }
        const userId = data.user.id;

        const { data: userData, error: userError } =
            await client
                .from("user_data")
                .select("*")
                .eq("user_id", userId)
                .single();

                if (userError) {
            console.log(userError);
            return;
        }
        userName.innerHTML = userData.fullName;
        profileName.innerHTML = userData.fullName;
        userEmail.innerHTML = userData.email;
        userInitial.innerHTML =
            userData.fullName.charAt(0).toUpperCase();

    }
    logoutBtn.addEventListener("click", async () => {
        const { error } =
            await client.auth.signOut();

        if (error) {
            console.log(error);
            return;
        }
        window.location.href = "./login.html";

    });
    getUser();
}


```js
// CREATE RECIPE

const recipeForm = document.querySelector("#recipeForm");

if (recipeForm) {

    const recipeImage =
        document.querySelector("#recipeImage");

    const imagePreview =
        document.querySelector("#imagePreview");

    const imagePreviewBox =
        document.querySelector("#imagePreviewBox");

    let imageUrl = "";


   ```js
// Image upload
recipeImage.addEventListener("change", async (event) => {

    const selectedImage = event.target.files[0];

    if (!selectedImage) {
        return;
    }

    // Show image preview
    imagePreview.src = URL.createObjectURL(selectedImage);
    imagePreviewBox.classList.remove("d-none");


    // Create unique file name
    const fileName =
        "recipe_" + Date.now() + "_" + selectedImage.name;


    // Upload image to Supabase Storage
    const { data, error } = await client
        .storage
        .from("Food_img")
        .upload(fileName, selectedImage, {
            cacheControl: "3600",
            upsert: false
        });


    // Check upload error
    if (error) {

        console.log("Image Upload Error:", error);

        Swal.fire({
            icon: "error",
            title: "Upload Failed!",
            text: error.message
        });

        return;
    }


    console.log("Image Uploaded:", data);


    // Get public image URL
    const { data: publicUrlData } = client
        .storage
        .from("Food_img")
        .getPublicUrl(fileName);


    imageUrl = publicUrlData.publicUrl;

    console.log("Image URL:", imageUrl);


    // Success
    Swal.fire({
        icon: "success",
        title: "Image Uploaded!",
        text: "Recipe image uploaded successfully.",
        timer: 1500,
        showConfirmButton: false
    });

});
```

```

    // Form 

    const title =
        document.querySelector("#recipeTitle");
    const category =
        document.querySelector("#category");
    const description =
        document.querySelector("#description");
    const cookingTime =
        document.querySelector("#cookingTime");
    const ingredients =
        document.querySelector("#ingredients");
    const instructions =
        document.querySelector("#instructions");


    // Submit recipe

    recipeForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const recipeTitle =
            title.value.trim();
        const recipeCategory =
            category.value;
        const recipeDescription =
            description.value.trim();
        const recipeCookingTime =
            cookingTime.value;
        const recipeIngredients =
            ingredients.value.trim();
        const recipeInstructions =
            instructions.value.trim();
        if (
            recipeTitle === "" ||
            recipeCategory === "" ||
            recipeDescription === "" ||
            recipeCookingTime === "" ||
            recipeIngredients === "" ||
            recipeInstructions === ""
        ) {

            Swal.fire({
                icon: "warning",
                title: "Missing Data",
                text: "Please fill all fields."
            });

            return;
        }


        // Get logged in user

        const { data: userData, error: userError } =
            await client.auth.getUser();

        if (userError || !userData.user) {

            Swal.fire({
                icon: "error",
                title: "Login Required",
                text: "Please login first."
            });
            return;
        }

        const userId =
            userData.user.id;


        // Insert recipe

        const { data, error } =
            await client
                .from("Recipe_information")
                .insert([

                    {
                        user_id: userId,
                        Recipe_Title: recipeTitle,
                        Category: recipeCategory,
                        Description: recipeDescription,
                        Cooking_Time: recipeCookingTime,
                        Ingredients: recipeIngredients,
                        Instructions: recipeInstructions,
                        image_URL: imageUrl
                    }
                ])
                .select();

        if (error) {

            console.log(
                "Insert Error:",
                error
            );

            Swal.fire({
                icon: "error",
                title: "Oops!",
                text: error.message
            });
            return;
        }


        console.log(
            "Recipe Created:",
            data
        );

        Swal.fire({
            icon: "success",
            title: "Successfully!",
            text: "Your recipe has been created successfully."
        }).then(() => {

            window.location.href =
                "./my-recipes.html";
        });
    });

}

// MY RECIPES

const myRecipesContainer =
    document.querySelector("#myRecipesContainer");


if (myRecipesContainer) {
    const noRecipesMessage =
        document.querySelector("#noRecipesMessage");
    const logoutBtn =
        document.querySelector("#logoutBtn");


    // Logout

    logoutBtn.addEventListener("click", async () => {

        const { error } =
            await client.auth.signOut();


        if (error) {
            console.log(error);
            return;
        }


        window.location.href =
            "./login.html";

    });


    // Get recipes

    async function getMyRecipes() {
        const { data: userData, error: userError } =
            await client.auth.getUser();


        if (userError || !userData.user) {

            window.location.href =
                "./login.html";

            return;
        }


        const userId =
            userData.user.id;


        // Get user name

        const { data: profile, error: profileError } =
            await client
                .from("user_data")
                .select("fullName")
                .eq("user_id", userId)
                .single();


        if (profileError) {
            console.log(
                "Profile Error:",
                profileError
            );
        }


        // Get recipes

        const { data: recipes, error: recipesError } =
            await client
                .from("Recipe_information")
                .select("*")
                .eq("user_id", userId)
                .order("created_at", {
                    ascending: false
                });


        if (recipesError) {
            console.log(
                "Recipe Error:",
                recipesError
            );

            return;
        }
        myRecipesContainer.innerHTML = "";

        if (
            !recipes ||
            recipes.length === 0
        ) {

            noRecipesMessage.classList.remove(
                "d-none"
            );
            return;
        }

        noRecipesMessage.classList.add(
            "d-none"
        );

        recipes.forEach((recipe) => {
            const card =
                document.createElement("div");
                card.className =
                "col-md-6 col-lg-4";
            let recipeImage =
                "https://via.placeholder.com/600x350?text=Recipe";


            if (recipe.image_URL) {
                recipeImage =
                    recipe.image_URL;
            }
            let authorName =
                "Unknown";

            if (profile) {
                authorName =
                    profile.fullName;
            }

            card.innerHTML = `
                <div class="card border-0 shadow-sm h-100">
                    <img src="${recipeImage}"
                        class="card-img-top"
                        style="height:220px; object-fit:cover;"
                        alt="${recipe.Recipe_Title}">

                    <div class="card-body">
                        <span class="badge bg-warning text-dark mb-2">
                            ${recipe.Category}
                        </span>
                        <h4 class="fw-bold">
                            ${recipe.Recipe_Title}
                        </h4>

                        <p class="text-muted">
                            ${recipe.Description}
                        </p>

                        <p class="mb-2">
                            <strong>
                                Cooking Time:
                            </strong>
                            ${recipe.Cooking_Time} minutes
                        </p>

                        <p class="text-muted small">
                            <strong>
                                Author:
                            </strong>
                            ${authorName}
                        </p>

                        <div class="d-flex gap-2">
                            <button
                                class="btn btn-primary btn-sm"
                                onclick="viewRecipe(${recipe.id})">
                                View
                            </button>
                            <button
                                class="btn btn-warning btn-sm"
                                onclick="editRecipe(${recipe.id})">
                                Edit
                            </button>
                            <button
                                class="btn btn-danger btn-sm"
                                onclick="deleteRecipe(${recipe.id})">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            `;
            myRecipesContainer.appendChild(card);
        });
    }
    getMyRecipes();
}


// VIEW RECIPE

async function viewRecipe(id) {
    window.location.href =
        "./recipe-details.html?id=" + id;

}


// DELETE RECIPE

async function deleteRecipe(id) {
    const result =
        await Swal.fire({
            icon: "warning",
            title: "Are you sure?",
            text: "You want to delete this recipe?",
            showCancelButton: true,
            confirmButtonText: "Yes, Delete",
            cancelButtonText: "Cancel"
        });


    if (!result.isConfirmed) {
        return;
    }


    const { error } =
        await client
            .from("Recipe_information")
            .delete()
            .eq("id", id);
    if (error) {
        console.log(error);

        Swal.fire({
            icon: "error",
            title: "Oops!",
            text: error.message
        });
        return;
    }


    Swal.fire({
        icon: "success",
        title: "Successfully!",
        text: "Recipe deleted successfully."
    }).then(() => {
        window.location.reload();
    });

}
// EDIT RECIPE

async function editRecipe(id) {

    window.location.href =
        "./create-recipe.html?id=" + id;

}