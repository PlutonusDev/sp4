import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";

import Layout from "../components/layouts";
import Link from "next/link";
import { CountryDropdown } from "react-country-region-selector";

import { AiOutlineCheckCircle, AiOutlineCloseCircle } from "react-icons/ai";

export default function Register() {
	//const reCaptcha = useGoogleReCaptcha();
	const [ successMsg, setSuccessMsg ] = useState("");
	const [ failMsg, setFailMsg ] = useState("");
	const [ country, setCountry ] = useState("");
	const router = useRouter();

	//useEffect(() => alert(JSON.stringify(reCaptcha)), [reCaptcha]);

	const validationSchema = Yup.object().shape({
		email: Yup.string()
			.email("Invalid email")
			.required("Email is required"),
		firstName: Yup.string()
			.required("First Name is required"),
		lastName: Yup.string()
			.required("Last Name is required"),
		dob: Yup.string()
			.required("Date of Birth is required")
			.matches(/^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/, "Date of Birth must be in YYYY-MM-DD"),
		country: Yup.string()
			.test("test-country", "Country is required", c => true),
		username: Yup.string()
			.required("Username or email is required"),
		password: Yup.string()
			.required("Password is required")
			.min(6, "Password must be at least 6 characters"),
		passwordConfirm: Yup.string()
			.oneOf([Yup.ref("password"), null], "Passwords must match")
			.required("Password Confirmation is required"),
		acceptTerms: Yup.bool()
			.oneOf([true], "You must accept the Terms and Conditions")
	});

	const formOptions = { resolver: yupResolver(validationSchema) };
	const { register, handleSubmit, reset, formState } = useForm(formOptions);
	const { errors } = formState;

	async function onSubmit(data) {
		setSuccessMsg("");
		setFailMsg("");

		//data.token = await executeReCaptcha("submit");
		data.country = country;

		const user = await fetch("/api/register", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify(data)
		}).then(resp => resp.json());

		if(user.loggedIn) {
			setSuccessMsg(`Registration successful! Redirecting...`);
			setTimeout(() => router.push("/dashboard"), 1000);
		} else {
			setFailMsg(user.msg || "Please check the form and try again.");
		}
	}

	return (
		<Layout title="Sign In">
			<div className="lg:w-1/2 xl:max-w-screen-sm">
				<div className="py-6 bg-gray-900 rounded-md shadow-lg dark:shadow-none lg:bg-white dark:lg:bg-gray-800 flex justify-center lg:justify-start lg:px-12">
					<div className="cursor-pointer flex items-center space-x-2">
						<img className="w-10 h-10" src="/static/images/logo.png" />
						<img className="h-10" src="/static/images/logo-text.png" />
					</div>
				</div>
				<div className="mt-10 px-12 sm:px-24 md:px-48 lg:px-12 lg:mt-16 xl:px-24 xl:max-w-2xl">
					<h2 className="text-center text-4xl font-display font-semibold lg:text-left xl:text-5xl xl:text-bold">
						Register
					</h2>
					<div className={`mt-12 alert alert-success ${successMsg ? "block" : "hidden"}`}>
						<div className="flex-1 space-x-2 items-center">
							<AiOutlineCheckCircle />
							<span>{successMsg}</span>
						</div>
					</div>
					<div className={`mt-12 alert alert-error ${failMsg ? "block" : "hidden"}`}>
						<div className="flex-1 space-x-2 items-center">
							<AiOutlineCloseCircle />
							<span>{failMsg}</span>
						</div>
					</div>
					<div className="mt-12">
						<form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
							<div className="form-control">
								<div className="block sm:flex sm:space-x-8">
									<div className="sm:w-1/2">
										<label htmlFor="firstName" className="label">
											<span className="label-text">First Name</span>
										</label>
										<input name="firstName" type="text" {...register("firstName")} className={`w-full text-lg input ${errors.firstName && "input-error"}`} />
										<div className="h-6 text-red-500">{errors.firstName?.message}</div>
									</div>
									<div className="sm:w-1/2">
										<label htmlFor="lastName" className="label">
											<span className="label-text">Last Name</span>
										</label>
										<input name="lastName" type="text" {...register("lastName")} className={`w-full text-lg input ${errors.lastName && "input-error"}`} />
										<div className="h-6 text-red-500">{errors.lastName?.message}</div>
									</div>
								</div>
							</div>
							<div className="form-control">
								<div className="block sm:flex sm:space-x-8">
									<div className="sm:w-1/2">
										<label htmlFor="country" className="label">
											<span className="label-text">Country of Primary Citizenship</span>
										</label>
										<CountryDropdown value={country} onChange={val => setCountry(val)} className={`w-full text-lg select ${errors.country && "select-error"}`} />
										<input name="country" type="hidden" {...register("country")} value="" />
										<div className="h-6 text-red-500">{errors.country?.message}</div>
									</div>
									<div className="sm:w-1/2">
										<label htmlFor="dob" className="label">
											<span className="label-text">Date of Birth</span>
										</label>
										<input name="dob" type="text" {...register("dob")} placeholder="YYYY-MM-DD" className={`w-full text-lg input ${errors.dob && "input-error"}`} />
										<div className="h-6 text-red-500">{errors.dob?.message}</div>
									</div>
								</div>
							</div>
							<div className="form-control">
								<div className="block sm:flex sm:space-x-8">
									<div className="sm:w-2/3">
										<label htmlFor="email" className="label">
											<span className="label-text">Email</span>
										</label>
										<input name="email" type="text" {...register("email")} className={`w-full text-lg input ${errors.email && "input-error"}`} />
										<div className="h-6 text-red-500">{errors.email?.message}</div>
									</div>
									<div className="sm:w-1/3">
										<label htmlFor="username" className="label">
											<span className="label-text">Username</span>
										</label>
										<input name="email" type="text" {...register("username")} className={`w-full text-lg input ${errors.username && "input-error"}`} />
										<div className="h-6 text-red-500">{errors.username?.message}</div>
									</div>
								</div>
							</div>
							<div className="form-control">
								<div className="block sm:flex sm:space-x-8">
									<div className="sm:w-1/2">
										<label htmlFor="password" className="label">
											<span className="label-text">Password</span>
										</label>
										<input name="password" type="password" {...register("password")} className={`w-full text-lg input ${errors.password && "input-error"}`} />
										<div className="h-6 text-red-500">{errors.password?.message}</div>
									</div>
									<div className="sm:w-1/2">
										<label htmlFor="passwordConfirm" className="label">
											<span className="label-text">Confirm Password</span>
										</label>
										<input name="passwordConfirm" type="password" {...register("passwordConfirm")} className={`w-full text-lg input ${errors.passwordConfirm && "input-error"}`} />
										<div className="h-6 text-red-500">{errors.passwordConfirm?.message}</div>
									</div>
								</div>
							</div>
							<div className="form-control mt-8">
								<button type="submit" className="mx-auto btn btn-primary w-32">Register</button>
							</div>
						</form>
						<div className="mt-12 text-sm font-display font-semibold text-gray-500 text-center">
							Already have an account?{" "}
							<Link href="/login">
								<span className="cursor-pointer text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-600">Sign in</span>
							</Link>
						</div>
					</div>
				</div>
			</div>
		</Layout>
	);
}
