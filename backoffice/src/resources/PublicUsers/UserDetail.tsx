import {
    useAuthenticated,
    useGetOne, useNotify,
    useRedirect,
} from "react-admin";
import {useParams} from 'react-router-dom';
import {
    Avatar,
    Box,
    Button,
    CircularProgress,
    Grid,
    LinearProgress,
    Stack,
    Tab,
    Tabs,
    Typography
} from "@mui/material";
import React from "react";
import {Card} from "@material-ui/core";
import StatusBadge from "./StatusBadge"
import BeneficiaryBadge from "./BeneficiaryBadge";
import ManualReviewModal from "./ManualReviewModal";
import Moment from "moment"
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import {red, yellow, green} from '@mui/material/colors';
import {CheckHistory, SubscriptionItemStatus} from "./types";
import {dataProvider} from "../../providers/dataProvider";
import CheckHistoryCard from "./CheckHistoryCard";
import StatusAvatar from "./StatusAvatar";

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}


function TabPanel(props: TabPanelProps) {
    const {children, value, index, ...other} = props;

    return (
        <div
            style={{width: "100%"}}
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{p: 3}}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}


const cardStyle = {
    width: "100%",
    marginTop: "20px",
    padding: 30,
}

const UserDetail = () => {
    useAuthenticated()
    const {id} = useParams(); // this component is rendered in the /books/:id path
    const redirect = useRedirect();
    const notify = useNotify();
    const [value, setValue] = React.useState(1);
    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };
    const {data, isLoading} = useGetOne(
        'public_accounts/user',
        {id},
        // redirect to the list if the book is not found
        {onError: () => redirect('/public_users/search')}
    );
    let activeBadge, beneficiaryBadge, creditProgression, digitalCreditProgression, subscriptionItems, idsCheckHistory;

    if (isLoading) {
        return <CircularProgress
            size={18}
            thickness={2}
        />;
    } else {
        activeBadge = StatusBadge(data.isActive)
        beneficiaryBadge = BeneficiaryBadge(data.roles[0])
        creditProgression = (data.userCredit.remainingCredit / data.userCredit.initialCredit) * 100
        digitalCreditProgression = (data.userCredit.remainingCredit / data.userCredit.initialCredit) * 100
        if (data.userHistory['subscriptions']['AGE18']['idCheckHistory'].length > 0) {
            idsCheckHistory = data.userHistory['subscriptions']['AGE18']['idCheckHistory']
            subscriptionItems = data.userHistory['subscriptions']['AGE18']['subscriptionItems']
        } else if (data.userHistory['subscriptions']['UNDERAGE']['idCheckHistory'].length > 0) {
            idsCheckHistory = data.userHistory['subscriptions']['UNDERAGE']['idCheckHistory']
            subscriptionItems = data.userHistory['subscriptions']['UNDERAGE']['subscriptionItems']
        }
    }


    async function resendValidationEmail() {
        const response = await dataProvider.postResendValidationEmail('public_accounts/user', data)
        const responseData = await response.json()
        if (response.code !== 200) {
            notify(Object.values(responseData)[0] as string, {type: "error"})
        }
    }

    return (<Grid
        container
        spacing={0}
        direction="column"
        alignItems="center"
        justifyContent="center"
    >
        <Card style={cardStyle}>
            <Grid container spacing={1}>
                <Grid item xs={10}>

                    <Grid container spacing={1}>
                        <Grid item xs={12}>
                            <div>
                                <Typography variant="h5" gutterBottom component="div">
                                    {data.lastName}&nbsp;{data.firstName} &nbsp;                     {data.isActive && activeBadge} &nbsp; {data.roles[0] && beneficiaryBadge}

                                </Typography>
                                <Typography variant="body1" gutterBottom component="div">
                                    User ID : {data.id}
                                </Typography>
                            </div>
                        </Grid>
                        <Grid item xs={6}>

                            <Typography variant="body2" gutterBottom component="div">
                                <strong>e-mail : </strong>{data.email}
                            </Typography>
                            <Typography variant="body2" gutterBottom component="div">
                                <strong>tél : </strong>{data.phoneNumber}
                            </Typography>

                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="body2" gutterBottom component="div">
                                Crédité le :

                            </Typography>
                        </Grid>
                    </Grid>


                </Grid>


                <Grid item xs={2}>
                    <div>
                        <Stack spacing={2}>
                            <Button variant={"contained"} disabled>Suspendre le compte</Button>

                            <ManualReviewModal userId={data.id}/>
                        </Stack>
                    </div>
                </Grid>
            </Grid>
        </Card>
        <Grid container spacing={1}>
            <Grid item xs={4}>
                <Card style={cardStyle}>
                    <Typography variant={"h5"}>
                        {data.userCredit.remainingCredit}&euro;
                    </Typography>
                    <Stack direction={"row"}
                           style={{width: "100%", justifyContent: "space-between", marginTop: 12, marginBottom: 12}}
                           spacing={0}>
                        <Typography variant={"body1"}>Crédit restant </Typography>
                        <Typography variant={"body1"}>{data.userCredit.initialCredit}&euro;</Typography>
                    </Stack>
                    <LinearProgress style={{width: "100%"}} color={"primary"} variant={"determinate"}
                                    value={creditProgression}/>

                </Card>
            </Grid>
            <Grid item xs={4}>
                <Card style={cardStyle}>
                    <Typography variant={"h5"}>
                        {data.userCredit.remainingDigitalCredit}&euro;

                    </Typography>
                    <Stack direction={"row"}
                           style={{width: "100%", justifyContent: "space-between", marginTop: 12, marginBottom: 12}}
                           spacing={0}>
                        <Typography variant={"body1"}>Crédit digital restant </Typography>
                        <Typography variant={"body1"}>{data.userCredit.initialCredit}&euro;</Typography>
                    </Stack>
                    <LinearProgress style={{width: "100%"}} color={"primary"} variant={"determinate"}
                                    value={digitalCreditProgression}/>
                </Card>
            </Grid>
            <Grid item xs={4}>
                {/*Carte infos dossier d'importation */}
                <Card style={{...cardStyle, paddingBottom: 40}}>

                    <Typography variant={"h5"}>
                        Dossier <strong>{idsCheckHistory[0]["type"]}</strong> importé
                        le :
                    </Typography>
                    <Typography
                        variant={"h4"}>{Moment(idsCheckHistory[0]["dateCreated"]).format('D/MM/YYYY à HH:mm')}
                    </Typography>

                </Card>
            </Grid>
        </Grid>
        <Grid container spacing={2} sx={{mt: 3}}>
            <Box sx={{borderBottom: 1, borderColor: 'divider', width: "100%"}}>
                <Tabs value={value} onChange={handleChange} aria-label="basic tabs example"
                      variant="fullWidth">
                    <Tab label="Historique du compte" {...a11yProps(0)} />
                    <Tab label="Informations Personnelles" {...a11yProps(1)} />
                    <Tab label="Suivi des réservations" {...a11yProps(2)} />
                </Tabs>
            </Box>
            <TabPanel value={value} index={0}>
                Bientôt disponible
            </TabPanel>
            <TabPanel value={value} index={1}>
                <Stack spacing={3}>
                    <Card style={cardStyle}>
                        <Typography variant={"h5"}>
                            Détails utilisateur
                        </Typography>
                        <Grid spacing={1} sx={{mt: 4}}>
                            <Stack spacing={3} direction={"row"} style={{width: "100%"}}>
                                <Grid item xs={4}>
                                    <p>Nom</p>
                                    <p>{data.lastName}</p>
                                </Grid>
                                <Grid item xs={4}>
                                    <p>Prénom</p>
                                    <p>{data.firstName}</p>
                                </Grid>
                                <Grid item xs={4}>
                                    <p>Email</p>
                                    <p>{data.email}</p>
                                    <Button onClick={resendValidationEmail}>Renvoyer l'email de validation</Button>
                                </Grid>
                            </Stack>
                            <Stack spacing={3} direction={"row"} style={{width: "100%"}}>

                                <Grid item xs={4}>
                                    <p>Numéro de téléphone</p>
                                    <p>{data.phoneNumber}</p>
                                    <Stack width={"60%"} spacing={0} textAlign={"left"}>
                                        <Button>Envoyer un code de validation</Button>
                                        <Button>Confirmer manuellement</Button>
                                    </Stack>
                                </Grid>
                                <Grid item xs={4}>
                                    <p>Date de naissance</p>
                                    <p>{Moment(data.dateOfBirth).format('D/MM/YYYY')}</p>
                                </Grid>
                                <Grid item xs={4}>
                                    <p>Date de création du compte : </p>
                                    <p>{Moment(idsCheckHistory[0]["dateCreated"]).format("D/MM/YYYY à HH:mm")}</p>
                                </Grid>
                            </Stack>
                            <Stack spacing={3} direction={"row"} style={{width: "100%"}}>

                                <Grid item xs={4}>
                                    <p>N&deg; de la pièce d’identité</p>
                                    <p>{idsCheckHistory[0]["technicalDetails"] && idsCheckHistory[0]["technicalDetails"]["identification_id"] && idsCheckHistory[0]["technicalDetails"]["identification_id"]}</p>
                                </Grid>
                                <Grid item xs={3}>
                                    <p>Adresse</p>
                                    <p></p>
                                </Grid>
                                <Grid item xs={2}>
                                    <p>CP</p>
                                    <p></p>
                                </Grid>
                                <Grid item xs={3}>
                                    <p>Ville</p>
                                    <p></p>
                                </Grid>
                            </Stack>
                        </Grid>
                    </Card>
                    <Card style={cardStyle}>
                        <Typography variant={"h5"}>
                            Parcours d'inscription {beneficiaryBadge}
                        </Typography>
                        <Grid container spacing={5} sx={{mt: 4}}>
                            <Grid item xs={6}>
                                <Stack spacing={3} direction={"row"} style={{width: "100%"}}>
                                    <Typography variant={"body1"}>
                                        Validation email
                                    </Typography>
                                    {StatusAvatar(subscriptionItems.find((item: { type: string, status: SubscriptionItemStatus; }) => item.type == "email-validation").status)}
                                </Stack>
                            </Grid>
                            <Grid item xs={6}>
                                <Stack spacing={3} direction={"row"} style={{width: "100%"}}>
                                    <Typography variant={"body1"}>Complétion Profil</Typography>
                                    {StatusAvatar(subscriptionItems.find((item: { type: string, status: SubscriptionItemStatus; }) => item.type == "profile-completion").status)}
                                </Stack>
                            </Grid>
                            <Grid item xs={6}>
                                <Stack spacing={3} direction={"row"} style={{width: "100%"}}>

                                    <Typography variant={"body1"}>Validation Téléphone</Typography>
                                    {StatusAvatar(subscriptionItems.find((item: { type: string, status: SubscriptionItemStatus; }) => item.type == "phone-validation").status)}
                                </Stack>
                            </Grid>
                            <Grid item xs={6}>
                                <Stack spacing={3} direction={"row"} style={{width: "100%"}}>

                                    <Typography variant={"body1"}>ID Check</Typography>
                                    {StatusAvatar(subscriptionItems.find((item: { type: string, status: SubscriptionItemStatus; }) => item.type == "identity-check").status)}

                                </Stack>
                            </Grid>
                            <Grid item xs={6}>
                                <Stack spacing={3} direction={"row"} style={{width: "100%"}}>

                                    <Typography variant={"body1"}>Profil Utilisateur</Typography>
                                    {StatusAvatar(subscriptionItems.find((item: { type: string, status: SubscriptionItemStatus; }) => item.type == "profile-completion").status)}
                                </Stack>
                            </Grid>
                            <Grid item xs={6}>
                                <Stack spacing={3} direction={"row"} style={{width: "100%"}}>

                                    <Typography variant={"body1"}>Honor Statement</Typography>
                                    {StatusAvatar(subscriptionItems.find((item: { type: string, status: SubscriptionItemStatus; }) => item.type == "honor-statement").status)}
                                </Stack>
                            </Grid>
                        </Grid>
                    </Card>

                    {idsCheckHistory.map((idCheckHistory: CheckHistory) => {
                        return (
                           <CheckHistoryCard {...idCheckHistory}/>
                        )
                    })}
                </Stack>

            </TabPanel>
            <TabPanel value={value} index={2}>
                Bientôt disponible
            </TabPanel>
        </Grid>
    </Grid>)

};

export default UserDetail;