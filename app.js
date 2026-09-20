const supabaseUrl =
    "https://ygkuxwnjqoksthnupvge.supabase.co";

const supabaseKey =
    "sb_publishable_FJK_9DuMbpGxslctbtZaMQ_iDpglgH5";

const { createClient } = supabase;

const client = createClient(
    supabaseUrl,
    supabaseKey
);


// ================= SIGN UP ========================

const signupForm = document.querySelector("#signupForm");

if (signupForm) {

    const name = document.querySelector("#name");
    const email = document.querySelector("#email");
    const password = document.querySelector("#password");


    signupForm.addEventListener("submit", async (event) => {

        event.preventDefault();


        // Check empty fields

        if (
            name.value.trim() === "" ||
            email.value.trim() === "" ||
            password.value.trim() === ""
        ) {

            Swal.fire({
                icon: "warning",
                title: "Missing Data",
                text: "Please fill all fields."
            });

            return;
        }


        try {

            // Create Supabase account

            const { data, error } =
                await client.auth.signUp({

                    email: email.value.trim(),
                    password: password.value

                });


            if (error) {

                console.log(error.message);

                Swal.fire({
                    icon: "error",
                    title: "Signup Failed",
                    text: error.message
                });

                return;
            }


            console.log(data);


            // Save user name

            if (data.user) {

                const fullName =
                    name.value.trim();


                const { error: userError } =
                    await client
                        .from("user_data")
                        .insert([
                            {
                                user_id: data.user.id,
                                fullName: fullName
                            }
                        ]);


                if (userError) {

                    console.log(userError.message);

                    Swal.fire({
                        icon: "error",
                        title: "User Data Error",
                        text: userError.message
                    });

                    return;
                }
            }


            // Success

            Swal.fire({
                icon: "success",
                title: "Account Created!",
                text: "Your account has been created successfully."
            }).then(() => {

                window.location.href =
                    "./dashboard.html";

            });


        } catch (error) {

            console.log(error);

            Swal.fire({
                icon: "error",
                title: "Something Went Wrong",
                text: error.message
            });

        }

    });

}


// ================= LOGIN ==========================

const loginForm = document.querySelector("#loginForm");

if (loginForm) {

    const email =
        document.querySelector("#email");

    const password =
        document.querySelector("#password");


    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();


        if (
            email.value.trim() === "" ||
            password.value.trim() === ""
        ) {

            Swal.fire({
                icon: "warning",
                title: "Missing Data",
                text: "Please enter email and password."
            });

            return;
        }


        const { data, error } =
            await client.auth.signInWithPassword({

                email: email.value.trim(),
                password: password.value

            });


        if (error) {

            console.log(error);

            Swal.fire({
                icon: "error",
                title: "Login Failed",
                text: error.message
            });

            return;
        }


        console.log(data);


        Swal.fire({
            icon: "success",
            title: "Login Successful!",
            text: "Welcome to RecipeShare."
        }).then(function () {

            window.location.href =
                "./dashboard.html";

        });

    });

}


// ==================================================
// =============== CREATE RECIPE ====================
// ==================================================

const recipeForm =
    document.querySelector("#recipeForm");

if (recipeForm) {

    const recipeImage =
        document.querySelector("#recipeImage");

    const recipeTitle =
        document.querySelector("#recipeTitle");

    const recipeDescription =
        document.querySelector("#recipeDescription");

    const recipeCategory =
        document.querySelector("#recipeCategory");

    const cookingTime =
        document.querySelector("#cookingTime");

    const ingredients =
        document.querySelector("#ingredients");

    const instructions =
        document.querySelector("#instructions");


    recipeForm.addEventListener("submit", async (event) => {

        event.preventDefault();


        try {

            // Get logged-in user

            const {
                data: { user },
                error: userError
            } = await client.auth.getUser();


            if (userError || !user) {

                Swal.fire({
                    icon: "warning",
                    title: "Login Required",
                    text: "Please login first."
                });

                return;
            }


            // Get image

            const imageFile =
                recipeImage.files[0];

            let imageUrl = null;


            // Upload image

            if (imageFile) {

                const fileName =
                    user.id +
                    "/" +
                    Date.now() +
                    "-" +
                    imageFile.name;


                const { data, error } =
                    await client
                        .storage
                        .from("recipe-images")
                        .upload(
                            fileName,
                            imageFile,
                            {
                                cacheControl: "3600",
                                contentType: imageFile.type,
                                upsert: false
                            }
                        );


                if (error) {

                    console.log(error);

                    Swal.fire({
                        icon: "error",
                        title: "Image Upload Failed",
                        text: error.message
                    });

                    return;
                }


                console.log(
                    "Image Uploaded:",
                    data
                );


                // Get image URL

                const {
                    data: publicUrlData
                } = client
                    .storage
                    .from("recipe-images")
                    .getPublicUrl(fileName);


                imageUrl =
                    publicUrlData.publicUrl;

            }


            // Get category

            const {
                data: categoryData,
                error: categoryError
            } = await client
                .from("category")
                .select("id")
                .eq(
                    "name",
                    recipeCategory.value
                )
                .single();


            if (categoryError) {

                console.log(categoryError);

                Swal.fire({
                    icon: "error",
                    title: "Category Error",
                    text: categoryError.message
                });

                return;
            }


            // Add recipe

            const {
                data: recipeData,
                error: recipeError
            } = await client
                .from("recipes")
                .insert([
                    {
                        user_id: user.id,
                        category_id: categoryData.id,
                        title: recipeTitle.value.trim(),
                        description: recipeDescription.value.trim(),
                        instructions: instructions.value.trim(),
                        cooking_time:
                            Number(cookingTime.value),
                        image_url: imageUrl
                    }
                ])
                .select()
                .single();


            if (recipeError) {

                console.log(recipeError);

                Swal.fire({
                    icon: "error",
                    title: "Recipe Not Added",
                    text: recipeError.message
                });

                return;
            }


            console.log(
                "Recipe Added:",
                recipeData
            );


            // Ingredients

            const ingredientLines =
                ingredients.value
                    .split("\n")
                    .map((item) => item.trim())
                    .filter((item) => item !== "");


            if (ingredientLines.length > 0) {

                const ingredientData =
                    ingredientLines.map((item) => {

                        return {
                            recipe_id:
                                recipeData.id,

                            ingredient_name:
                                item,

                            quantity:
                                null
                        };

                    });


                const {
                    error: ingredientError
                } = await client
                    .from("ingredients")
                    .insert(ingredientData);


                if (ingredientError) {

                    console.log(
                        ingredientError
                    );

                    Swal.fire({
                        icon: "warning",
                        title: "Recipe Added",
                        text: "Recipe added, but ingredients could not be saved."
                    });

                    return;
                }

            }


            // Success

            Swal.fire({
                icon: "success",
                title: "Recipe Added!",
                text: "Your recipe has been added successfully."
            }).then(() => {

                window.location.href =
                    "./my-recipes.html";

            });


        } catch (error) {

            console.log(error);

            Swal.fire({
                icon: "error",
                title: "Something Went Wrong",
                text: error.message
            });

        }

    });

}


// ==================================================
// ================= LOGOUT =========================
// ==================================================

const logoutBtn =
    document.querySelector("#logoutBtn");


if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async () => {

            const { error } =
                await client.auth.signOut();


            if (error) {

                console.log(error.message);

                Swal.fire({
                    icon: "error",
                    title: "Logout Failed",
                    text: error.message
                });

                return;
            }


            window.location.href =
                "./index.html";

        }
    );

}